import { getSession } from "../../_lib/auth";
import { decryptApiKey, encryptApiKey, maskApiKey } from "../../_lib/crypto";
import { all, first, type ConfigRow } from "../../_lib/db";
import type { AppFunction } from "../../_lib/env";
import { json, readJson } from "../../_lib/http";

const PROVIDERS = new Set(["openai", "anthropic", "gemini"]);

interface ConfigBody {
  name?: string;
  base_url?: string;
  api_key?: string;
  provider?: string;
}

export const onRequestGet: AppFunction = async ({ request, env }) => {
  const user = await getSession(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const rows = await all<ConfigRow>(
    env.DB,
    "SELECT * FROM saved_configs WHERE user_id = ? ORDER BY updated_at DESC",
    user.userId
  );
  const configs = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      name: row.name,
      base_url: row.base_url,
      api_key_masked: maskApiKey(await decryptApiKey(env, row.api_key_enc)),
      provider: row.provider || "openai",
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))
  );
  return json({ configs });
};

export const onRequestPost: AppFunction = async ({ request, env }) => {
  const user = await getSession(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const body = await readJson<ConfigBody>(request);
  const name = body.name?.trim();
  const apiKey = body.api_key?.trim();
  const provider = body.provider || "openai";
  if (!name || !apiKey) return json({ error: "name、api_key 均为必填项" }, 400);
  if (!PROVIDERS.has(provider)) return json({ error: "不支持的 Provider" }, 400);

  const config = await first<ConfigRow>(
    env.DB,
    `INSERT INTO saved_configs (user_id, name, base_url, api_key_enc, provider)
     VALUES (?, ?, ?, ?, ?)
     RETURNING *`,
    user.userId,
    name,
    body.base_url?.trim() || "",
    await encryptApiKey(env, apiKey),
    provider
  );
  if (!config) throw new Error("配置创建失败");

  return json(
    {
      config: {
        id: config.id,
        name: config.name,
        base_url: config.base_url,
        api_key_masked: maskApiKey(apiKey),
        provider: config.provider,
        created_at: config.created_at,
        updated_at: config.updated_at,
      },
    },
    201
  );
};
