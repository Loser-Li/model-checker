export interface UserRow {
  id: number;
  email: string | null;
  password_hash: string | null;
  oauth_provider: string | null;
  oauth_id: string | null;
  avatar_url: string | null;
  username: string | null;
  created_at: string;
}

export interface ConfigRow {
  id: number;
  user_id: number;
  name: string;
  base_url: string;
  api_key_enc: string;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface HistoryRow {
  id: number;
  user_id: number;
  config_id: number | null;
  config_name: string;
  base_url: string;
  total: number;
  success: number;
  failed: number;
  results_json: string;
  created_at: string;
}

export async function first<T>(
  db: D1Database,
  sql: string,
  ...bindings: unknown[]
): Promise<T | null> {
  return db.prepare(sql).bind(...bindings).first<T>();
}

export async function all<T>(
  db: D1Database,
  sql: string,
  ...bindings: unknown[]
): Promise<T[]> {
  const result = await db.prepare(sql).bind(...bindings).all<T>();
  return result.results;
}

export async function run(
  db: D1Database,
  sql: string,
  ...bindings: unknown[]
): Promise<D1Result<unknown>> {
  return db.prepare(sql).bind(...bindings).run();
}
