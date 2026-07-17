import { hashPassword, signToken, tokenCookie } from "../../_lib/auth";
import { first, type UserRow } from "../../_lib/db";
import type { AppFunction } from "../../_lib/env";
import { json, readJson } from "../../_lib/http";

interface RegisterBody {
  email?: string;
  password?: string;
}

export const onRequestPost: AppFunction = async ({ request, env }) => {
  const body = await readJson<RegisterBody>(request);
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) return json({ error: "邮箱和密码不能为空" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "邮箱格式不正确" }, 400);
  }
  if (password.length < 6) return json({ error: "密码长度不能少于 6 位" }, 400);

  const existing = await first<UserRow>(
    env.DB,
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    email
  );
  if (existing) {
    return json(
      {
        error: existing.password_hash
          ? "该邮箱已注册"
          : "该邮箱已通过第三方登录注册，请使用 GitHub 或 LinuxDo 登录",
      },
      409
    );
  }

  const user = await first<UserRow>(
    env.DB,
    `INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING *`,
    email,
    await hashPassword(password)
  );
  if (!user) throw new Error("用户创建失败");

  const token = await signToken(env, user.id, email);
  return json(
    { user: { id: user.id, email } },
    201,
    { "Set-Cookie": tokenCookie(request, token) }
  );
};
