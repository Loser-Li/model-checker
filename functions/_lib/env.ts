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

/**
 * 缺失环境变量时抛出的错误。中间件会把它转成可读的 500 响应（而非笼统的
 * "服务器内部错误"），方便部署时定位漏配的 secret。
 */
export class MissingEnvError extends Error {
  constructor(public readonly name_: string) {
    super(`未配置环境变量 ${name_}`);
    this.name = "MissingEnvError";
  }
}

export function requireEnv(env: Env, name: keyof Env): string {
  const value = env[name];
  if (typeof value !== "string" || !value) {
    throw new MissingEnvError(String(name));
  }
  return value;
}
