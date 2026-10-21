import { DatabaseSync } from 'node:sqlite';
import { datasetSchema } from '../shared/schemas.mjs';

// Single process SQLite storage; deployment must protect the file and backups.
export function createStore(filename) {
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, data TEXT NOT NULL)');
  db.prepare('INSERT OR IGNORE INTO state VALUES (1, 0, ?)').run(JSON.stringify({ deals: [], referents: [] }));
  return {
    read() { const row = db.prepare('SELECT revision, data FROM state WHERE id=1').get(); return { revision: row.revision, ...datasetSchema.parse(JSON.parse(row.data)) }; },
    write(data, revision) {
      const result = db.prepare('UPDATE state SET data=?, revision=revision+1 WHERE id=1 AND revision=?').run(JSON.stringify(datasetSchema.parse(data)), revision);
      return result.changes === 1;
    },
    close() { db.close(); }
  };
}
