import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Store, HttpError } from '../src/store.js';

function freshStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coy-'));
  const file = path.join(dir, 'db.json');
  return { store: new Store(file), file };
}
const likers = (s) => s.db.profiles.filter((p) => p.likesMe);
const nonLikers = (s) => s.db.profiles.filter((p) => !p.likesMe);

test('seeds at least 30 profiles, some of whom already like the user', () => {
  const { store } = freshStore();
  assert.ok(store.db.profiles.length >= 30);
  assert.ok(likers(store).length >= 5);
  assert.ok(nonLikers(store).length >= 5);
  for (const p of store.db.profiles) {
    for (const k of ['name', 'age', 'place', 'bio', 'interests']) assert.ok(p[k], `${p.id} missing ${k}`);
  }
});

test('feed never exposes who liked the user', () => {
  const { store } = freshStore();
  const json = JSON.stringify(store.feed());
  assert.ok(!json.includes('likesMe'));
});

test('feed order is not correlated with likesMe (first 10 are a mix)', () => {
  const { store } = freshStore();
  const ids = new Set(likers(store).map((p) => p.id));
  const n = store.feed().slice(0, 10).filter((p) => ids.has(p.id)).length;
  assert.ok(n > 0 && n < 10);
});

test('swiped profiles never come back in the feed', () => {
  const { store } = freshStore();
  const [a, b] = store.feed();
  store.swipe(a.id, 'pass');
  store.swipe(b.id, 'like');
  const ids = store.feed().map((p) => p.id);
  assert.ok(!ids.includes(a.id) && !ids.includes(b.id));
  assert.equal(ids.length, store.db.profiles.length - 2);
});

test('liking someone who liked you creates a match', () => {
  const { store } = freshStore();
  const p = likers(store)[0];
  const res = store.swipe(p.id, 'like');
  assert.equal(res.matched, true);
  assert.equal(res.match.id, p.id);
  assert.equal(store.matches().length, 1);
});

test('liking someone who did NOT like you does not match', () => {
  const { store } = freshStore();
  const res = store.swipe(nonLikers(store)[0].id, 'like');
  assert.equal(res.matched, false);
  assert.equal(store.matches().length, 0);
});

test('passing never matches, even if they liked you', () => {
  const { store } = freshStore();
  assert.equal(store.swipe(likers(store)[0].id, 'pass').matched, false);
  assert.equal(store.matches().length, 0);
});

test('no-match response carries no hint about the other side', () => {
  const { store } = freshStore();
  assert.deepEqual(store.swipe(nonLikers(store)[0].id, 'like'), { matched: false });
});

test('matches only list mutual matches and hide likesMe', () => {
  const { store } = freshStore();
  store.swipe(likers(store)[0].id, 'like');
  store.swipe(likers(store)[1].id, 'pass');
  store.swipe(nonLikers(store)[0].id, 'like');
  const out = store.matches();
  assert.equal(out.length, 1);
  assert.ok(!JSON.stringify(out).includes('likesMe'));
});

test('swiping the same profile twice is rejected', () => {
  const { store } = freshStore();
  const p = store.feed()[0];
  store.swipe(p.id, 'pass');
  assert.throws(() => store.swipe(p.id, 'like'), (e) => e instanceof HttpError && e.status === 409);
});

test('validates input', () => {
  const { store } = freshStore();
  assert.throws(() => store.swipe(undefined, 'like'), (e) => e.status === 400);
  assert.throws(() => store.swipe('p01', 'maybe'), (e) => e.status === 400);
  assert.throws(() => store.swipe('nope', 'like'), (e) => e.status === 404);
});

test('swipes and matches persist across restarts', () => {
  const { store, file } = freshStore();
  const p = likers(store)[0];
  const q = nonLikers(store)[0];
  store.swipe(p.id, 'like');
  store.swipe(q.id, 'pass');
  const reopened = new Store(file);
  assert.equal(reopened.matches().length, 1);
  const ids = reopened.feed().map((x) => x.id);
  assert.ok(!ids.includes(p.id) && !ids.includes(q.id));
  assert.throws(() => reopened.swipe(p.id, 'like'), (e) => e.status === 409);
});

test('empty feed after swiping everyone, and reset restores it', () => {
  const { store } = freshStore();
  for (const p of store.feed()) store.swipe(p.id, 'pass');
  assert.equal(store.feed().length, 0);
  store.reset();
  assert.equal(store.feed().length, store.db.profiles.length);
  assert.equal(store.matches().length, 0);
});
