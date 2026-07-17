import { signToken, tokenCookie, verifyPassword } from "../../_lib/auth";
import { first, type UserRow } from "../../_lib/db";
import type { AppFunction } from "../../_lib/env";
import { json, readJson } from "../../_lib/http";

interface LoginBody {
  email?: string;
  password?: string;
}

export const onRequestPost: AppFunction = async ({ request, env }) => {
  const body = await readJson<LoginBody>(request);
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!email || !password) return json({ error: "邮箱和密码不能为空" }, 400);

  const user = await first<UserRow>(
    env.DB,
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    email
  );
  if (!user) return json({ error: "邮箱或密码错误" }, 401);
  if (!user.password_hash) {
    return json({ error: "该账号使用第三方登录，请使用 GitHub 或 LinuxDo 登录" }, 401);
  }
  if (!(await verifyPassword(password, user.password_hash))) {
    return json({ error: "邮箱或密码错误" }, 401);
  }

  const token = await signToken(env, user.id, user.email || email);
  return json(
    { user: { id: user.id, email: user.email || email } },
    200,
    { "Set-Cookie": tokenCookie(request, token) }
  );
};
