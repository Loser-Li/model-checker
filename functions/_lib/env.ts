export interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
  ENCRYPTION_KEY?: string;
  OAUTH_CALLBACK_URL?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  LINUXDO_CLIENT_ID?: string;
  LINUXDO_CLIENT_SECRET?: string;
  LINUXDO_BASE_URL?: string;
}

export type AppFunction = PagesFunction<Env>;

export function requireEnv(env: Env, name: keyof Env): string {
  const value = env[name];
  if (typeof value !== "string" || !value) {
    throw new Error(`Missing Cloudflare environment variable: ${name}`);
  }
  return value;
}
