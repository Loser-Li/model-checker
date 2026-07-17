import { getSession, randomState, signToken, tokenCookie } from "./auth";
import { first, type UserRow } from "./db";
import type { Env } from "./env";
import { cookie, getCookie, redirect } from "./http";
import {
  githubAuthorizeUrl,
  githubOAuthUser,
  linuxDoAuthorizeUrl,
  linuxDoOAuthUser,
  type OAuthUser,
} from "./oauth";

type Provider = OAuthUser["provider"];

function homeUrl(request: Request, error?: string): URL {
  const url = new URL("/", request.url);
  if (error) url.searchParams.set("error", error);
  return url;
}

function clearStateCookie(request: Request): string {
  return cookie("oauth_state", "", request, 0);
}

export function beginOAuth(env: Env, request: Request, provider: Provider): Response {
  const state = randomState();
  const location = provider === "github"
    ? githubAuthorizeUrl(env, request, state)
    : linuxDoAuthorizeUrl(env, request, state);
  return redirect(location, {
    "Set-Cookie": cookie("oauth_state", state, request, 60 * 10),
  });
}

async function findOrCreateOAuthUser(env: Env, oauthUser: OAuthUser): Promise<UserRow> {
  const existing = await first<UserRow>(
    env.DB,
    `SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ? LIMIT 1`,
    oauthUser.provider,
    oauthUser.oauthId
  );

  if (existing) {
    const updated = await first<UserRow>(
      env.DB,
      `UPDATE users
       SET email = COALESCE(?, email), avatar_url = ?, username = ?
       WHERE id = ?
       RETURNING *`,
      oauthUser.email,
      oauthUser.avatarUrl,
      oauthUser.username,
      existing.id
    );
    if (!updated) throw new Error("OAuth 用户更新失败");
    return updated;
  }

  const created = await first<UserRow>(
    env.DB,
    `INSERT INTO users (email, oauth_provider, oauth_id, avatar_url, username)
     VALUES (?, ?, ?, ?, ?)
     RETURNING *`,
    oauthUser.email,
    oauthUser.provider,
    oauthUser.oauthId,
    oauthUser.avatarUrl,
    oauthUser.username
  );
  if (!created) throw new Error("OAuth 用户创建失败");
  return created;
}

export async function finishOAuth(
  env: Env,
  request: Request,
  provider: Provider
): Promise<Response> {
  const url = new URL(request.url);
  const providerError = url.searchParams.get("error");
  if (providerError) {
    return redirect(homeUrl(request, providerError), {
      "Set-Cookie": clearStateCookie(request),
    });
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = getCookie(request, "oauth_state");
  if (!code || !state) {
    return redirect(homeUrl(request, "missing_params"), {
      "Set-Cookie": clearStateCookie(request),
    });
  }
  if (!storedState || storedState !== state) {
    return redirect(homeUrl(request, "invalid_state"), {
      "Set-Cookie": clearStateCookie(request),
    });
  }

  try {
    const oauthUser = provider === "github"
      ? await githubOAuthUser(env, request, code)
      : await linuxDoOAuthUser(env, request, code);
    const user = await findOrCreateOAuthUser(env, oauthUser);
    const token = await signToken(env, user.id, user.email || oauthUser.username);
    const headers = new Headers();
    headers.append("Set-Cookie", tokenCookie(request, token));
    headers.append("Set-Cookie", clearStateCookie(request));
    return redirect(homeUrl(request), headers);
  } catch (error) {
    console.error(`${provider} OAuth error`, error);
    const message = error instanceof Error ? error.message : "oauth_failed";
    return redirect(homeUrl(request, message), {
      "Set-Cookie": clearStateCookie(request),
    });
  }
}
