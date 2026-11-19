# Coy · Discover tab

A swipe-based "Discover" tab for Coy, built as a standalone app. The Home tab is intentionally blank.

**Stack:** React (Vite), mobile-first · Node.js + Express · JSON file for storage (`server/data/db.json`).

## Run it

```bash
npm install            # installs the root dev tool (concurrently)
npm run install:all    # installs server + client dependencies
npm run dev            # API on :3001, app on http://localhost:5173
npm test               # backend tests (Node's built-in test runner)
```

Open http://localhost:5173 (use your browser's mobile view to try drag gestures; on desktop use the buttons or the ← / → keys).

## What's in it

- 36 seeded profiles (name, age, placeholder photo, bio, city/college, interests). 12 of them already like you, so matches show up quickly in a demo.
- One card at a time with a card stack behind it. Drag right to like, left to pass. Buttons and arrow keys do the same thing. Like/Pass stamps fade in as you drag.
- "It's a match!" screen on a mutual like, and a Matches list (inside the Discover tab, next to Swipe).
- Empty state when you've swiped everyone, with a "Reset demo data" link so you can run the demo again.
- Swipes and matches are stored in `server/data/db.json`, so they survive reloads and server restarts.

## API

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/feed` | Profiles not yet swiped on. |
| POST | `/swipe` | Body `{ "profileId": "p07", "direction": "like" \| "pass" }`. Returns `{ "matched": false }` or `{ "matched": true, "match": {...} }`. Returns 409 if you already swiped that profile. |
| GET | `/matches` | Mutual matches only, newest first. |
| POST | `/reset` | Demo helper. Clears swipes and matches. |
| GET | `/photos/:id.svg` | Generated placeholder photo (works offline). |

## How the privacy promise is kept

Coy's core rule is that nobody learns who liked them unless it's mutual. The design enforces that in a few places:

1. **`likesMe` never leaves the server.** The only function that turns a stored profile into API output is `toPublic()` in `server/src/store.js`, and it copies an explicit list of fields. A new field has to be added on purpose.
2. **A pass can never match**, even if that person liked you.
3. **A like that doesn't match returns just `{ "matched": false }`.** The response is identical for "they haven't liked you" and any other non-match case.
4. **Feed order is shuffled** (seeded) so position in the feed doesn't hint at who already likes you.
5. **`/matches` only returns mutual matches**, and there's no endpoint that lists likes.

Tests for all of this are in `server/test/store.test.js`.

## Project layout

```
server/src/seed.js     mock profiles
server/src/store.js    all swipe/match rules + JSON persistence (atomic writes)
server/src/app.js      Express routes
client/src/components  Discover, SwipeCard, MatchOverlay, Matches
```

## Part A

See [PART_A_FEATURES.md](./PART_A_FEATURES.md).
