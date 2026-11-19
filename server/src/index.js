import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Store } from './store.js';
import { createApp } from './app.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const store = new Store(path.join(dir, '..', 'data', 'db.json'));
const port = process.env.PORT || 3001;

createApp(store).listen(port, () => {
  console.log(`Coy Discover API running on http://localhost:${port}`);
});
