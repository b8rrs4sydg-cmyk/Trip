// 資料表在第一次收到請求時自動建立,所以「一鍵部署」和手動部署都不需要另外跑 migration。
// 全部用 IF NOT EXISTS,重複執行無害。
const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    days INTEGER NOT NULL DEFAULT 3,
    tips TEXT NOT NULL DEFAULT '{}',
    version INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    name TEXT NOT NULL,
    lat REAL,
    lng REAL,
    url TEXT,
    note TEXT NOT NULL DEFAULT '',
    added_by TEXT NOT NULL DEFAULT ''
  )`,
  'CREATE INDEX IF NOT EXISTS items_trip ON items(trip_id, day, position)',
];

let ready = null;

export function ensureSchema(env) {
  // 同一個 isolate 只做一次;失敗時清掉,下次請求再試
  ready ??= env.DB.batch(STATEMENTS.map((s) => env.DB.prepare(s))).catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}
