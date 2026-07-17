import { getSession } from "../../_lib/auth";
import { first, type UserRow } from "../../_lib/db";
import type { AppFunction } from "../../_lib/env";
import { json } from "../../_lib/http";

export const onRequestGet: AppFunction = async ({ request, env }) => {
  const session = await getSession(request, env);
  if (!session) return json({ user: null });

  const user = await first<UserRow>(env.DB, "SELECT * FROM users WHERE id = ?", session.userId);
  if (!user) return json({ user: null });

  return json({
    user: {
      id: user.id,
      userId: user.id,
      email: user.email,
      avatarUrl: user.avatar_url,
      username: user.username,
      oauthProvider: user.oauth_provider,
    },
  });
};
