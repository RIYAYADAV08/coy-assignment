import express from 'express';
import { HttpError } from './store.js';
import { photoSvg } from './photo.js';

export function createApp(store) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  // Profiles the user has not swiped on yet.
  app.get('/feed', (req, res) => {
    res.json({ profiles: store.feed() });
  });

  // Body: { profileId, direction: "like" | "pass" }  ->  { matched, match? }
  app.post('/swipe', (req, res, next) => {
    try {
      const { profileId, direction } = req.body ?? {};
      res.json(store.swipe(profileId, direction));
    } catch (err) {
      next(err);
    }
  });

  // Mutual matches only.
  app.get('/matches', (req, res) => {
    res.json({ matches: store.matches() });
  });

  // Demo helper: wipes swipes/matches and re-seeds.
  app.post('/reset', (req, res) => {
    store.reset();
    res.json({ ok: true });
  });

  app.get('/photos/:id.svg', (req, res) => {
    const profile = store.getProfile(req.params.id);
    if (!profile) return res.status(404).end();
    res.set('Cache-Control', 'public, max-age=86400');
    res.type('image/svg+xml').send(photoSvg(profile));
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  });

  return app;
}
