import fs from 'node:fs';
import path from 'node:path';
import { buildSeed } from './seed.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// The ONLY place a profile is converted for the outside world.
// `likesMe` is deliberately not copied: this is what keeps Coy's promise.
export function toPublic(p) {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    place: p.place,
    bio: p.bio,
    interests: p.interests,
    photo: `/photos/${p.id}.svg`
  };
}

export class Store {
  constructor(file) {
    this.file = file;
    this.db = null;
    this.#load();
  }

  #load() {
    if (fs.existsSync(this.file)) {
      try {
        this.db = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        return;
      } catch {
        // corrupted file: fall through and re-seed
      }
    }
    this.db = buildSeed();
    this.#save();
  }

  // Write to a temp file then rename, so a crash can't leave half a file.
  #save() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.db, null, 2));
    fs.renameSync(tmp, this.file);
  }

  feed() {
    return this.db.profiles.filter((p) => !this.db.swipes[p.id]).map(toPublic);
  }

  swipe(profileId, direction) {
    if (typeof profileId !== 'string' || !profileId) {
      throw new HttpError(400, 'profileId is required');
    }
    if (direction !== 'like' && direction !== 'pass') {
      throw new HttpError(400, 'direction must be "like" or "pass"');
    }
    const profile = this.db.profiles.find((p) => p.id === profileId);
    if (!profile) throw new HttpError(404, 'Profile not found');
    if (this.db.swipes[profileId]) throw new HttpError(409, 'Already swiped on this profile');

    const at = new Date().toISOString();
    this.db.swipes[profileId] = { direction, at };

    // A match needs BOTH sides to like. A pass can never create one.
    const matched = direction === 'like' && profile.likesMe === true;
    if (matched) this.db.matches.push({ profileId, matchedAt: at });

    this.#save();
    return matched ? { matched, match: this.#matchView({ profileId, matchedAt: at }) } : { matched };
  }

  #matchView(m) {
    const p = this.db.profiles.find((x) => x.id === m.profileId);
    return { ...toPublic(p), matchedAt: m.matchedAt };
  }

  matches() {
    return [...this.db.matches]
      .sort((a, b) => b.matchedAt.localeCompare(a.matchedAt))
      .map((m) => this.#matchView(m));
  }

  getProfile(id) {
    return this.db.profiles.find((p) => p.id === id);
  }

  reset() {
    this.db = buildSeed();
    this.#save();
  }
}
