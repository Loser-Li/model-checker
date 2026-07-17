import type { Env } from "./env";
import { requireEnv } from "./env";

export interface OAuthUser {
  provider: "github" | "linuxdo";
  oauthId: string;
  username: string;
  email: string | null;
  avatarUrl: string;
}

function callbackUrl(env: Env, request: Request, provider: OAuthUser["provider"]): string {
  const configured = env.OAUTH_CALLBACK_URL?.replace(/\/+$/, "");
  const base = configured || new URL(request.url).origin;
  return `${base}/api/auth/callback/${provider}`;
}

async function responseJson<T>(response: Response, label: string): Promise<T> {
  const text = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`${label} 返回了无效响应（HTTP ${response.status}）`);
  }
  if (!response.ok) {
    const detail = data && typeof data === "object" && "error_description" in data
      ? String(data.error_description)
      : text;
    throw new Error(`${label} 失败（HTTP ${response.status}）: ${detail}`);
  }
  return data as T;
}

export function githubAuthorizeUrl(env: Env, request: Request, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: requireEnv(env, "GITHUB_CLIENT_ID"),
    state,
    scope: "user:email read:user",
    redirect_uri: callbackUrl(env, request, "github"),
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function githubOAuthUser(
  env: Env,
  request: Request,
  code: string
): Promise<OAuthUser> {
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: requireEnv(env, "GITHUB_CLIENT_ID"),
      client_secret: requireEnv(env, "GITHUB_CLIENT_SECRET"),
      code,
      redirect_uri: callbackUrl(env, request, "github"),
    }),
    signal: AbortSignal.timeout(30_000),
  });
  const token = await responseJson<{ access_token: string }>(tokenResponse, "GitHub Token 交换");

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Model-Checker",
    },
    signal: AbortSignal.timeout(30_000),
  });
  const user = await responseJson<{
    id: number;
    login: string;
    email: string | null;
    avatar_url: string;
  }>(userResponse, "GitHub 用户信息读取");

  return {
    provider: "github",
    oauthId: String(user.id),
    username: user.login,
    email: user.email,
    avatarUrl: user.avatar_url,
  };
}

function linuxDoBase(env: Env): string {
  return (env.LINUXDO_BASE_URL || "https://connect.linux.do").replace(/\/+$/, "");
}

export function linuxDoAuthorizeUrl(env: Env, request: Request, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: requireEnv(env, "LINUXDO_CLIENT_ID"),
    state,
    scope: "read",
    redirect_uri: callbackUrl(env, request, "linuxdo"),
  });
  return `${linuxDoBase(env)}/oauth2/authorize?${params}`;
}

export async function linuxDoOAuthUser(
  env: Env,
  request: Request,
  code: string
): Promise<OAuthUser> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: requireEnv(env, "LINUXDO_CLIENT_ID"),
    client_secret: requireEnv(env, "LINUXDO_CLIENT_SECRET"),
    code,
    redirect_uri: callbackUrl(env, request, "linuxdo"),
  });
  const tokenResponse = await fetch(`${linuxDoBase(env)}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    signal: AbortSignal.timeout(30_000),
  });
  const token = await responseJson<{ access_token: string }>(tokenResponse, "LinuxDo Token 交换");

  const userResponse = await fetch(`${linuxDoBase(env)}/api/user`, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      Accept: "application/json",
      "User-Agent": "Model-Checker",
    },
    signal: AbortSignal.timeout(30_000),
  });
  const response = await responseJson<{
    user?: {
      id: number;
      external_id?: string;
      username: string;
      email?: string;
      avatar_url?: string;
    };
    id?: number;
    external_id?: string;
    username?: string;
    email?: string;
    avatar_url?: string;
  }>(userResponse, "LinuxDo 用户信息读取");
  const user = response.user || response;
  if (!user.id || !user.username) throw new Error("LinuxDo 用户信息不完整");

  return {
    provider: "linuxdo",
    oauthId: String(user.external_id || user.id),
    username: user.username,
    email: user.email || null,
    avatarUrl:
      user.avatar_url ||
      `https://connect.linux.do/user_avatar/linux.do/${user.username}/size/240`,
  };
}
