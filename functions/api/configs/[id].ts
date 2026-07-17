import { getSession } from "../../_lib/auth";
import { decryptApiKey, encryptApiKey, maskApiKey } from "../../_lib/crypto";
import { first, run, type ConfigRow } from "../../_lib/db";
import type { AppFunction } from "../../_lib/env";
import { json, parseId, readJson } from "../../_lib/http";

const PROVIDERS = new Set(["openai", "anthropic", "gemini"]);

interface ConfigBody {
  name?: string;
  base_url?: string;
  api_key?: string;
  provider?: string;
}

async function ownedConfig(
  env: Parameters<AppFunction>[0]["env"],
  id: number,
  userId: number
): Promise<ConfigRow | Response> {
  const row = await first<ConfigRow>(env.DB, "SELECT * FROM saved_configs WHERE id = ?", id);
  if (!row) return json({ error: "配置不存在" }, 404);
  if (row.user_id !== userId) return json({ error: "无权操作此配置" }, 403);
  return row;
}

export const onRequestGet: AppFunction = async ({ request, env, params }) => {
  const user = await getSession(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const id = parseId(params.id);
  if (!id) return json({ error: "无效的配置 ID" }, 400);

  const config = await ownedConfig(env, id, user.userId);
  if (config instanceof Response) return config;
  return json({
    config: {
      id: config.id,
      name: config.name,
      base_url: config.base_url,
      api_key: await decryptApiKey(env, config.api_key_enc),
      provider: config.provider || "openai",
      created_at: config.created_at,
      updated_at: config.updated_at,
    },
  });
};

export const onRequestPut: AppFunction = async ({ request, env, params }) => {
  const user = await getSession(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const id = parseId(params.id);
  if (!id) return json({ error: "无效的配置 ID" }, 400);

  const existing = await ownedConfig(env, id, user.userId);
  if (existing instanceof Response) return existing;
  const body = await readJson<ConfigBody>(request);
  if (
    body.name === undefined &&
    body.base_url === undefined &&
    body.api_key === undefined &&
    body.provider === undefined
  ) {
    return json({ error: "至少需要提供一个更新字段" }, 400);
  }
  if (body.provider !== undefined && !PROVIDERS.has(body.provider)) {
    return json({ error: "不支持的 Provider" }, 400);
  }
  if (body.name !== undefined && !body.name.trim()) {
    return json({ error: "配置名称不能为空" }, 400);
  }
  if (body.api_key !== undefined && !body.api_key.trim()) {
    return json({ error: "API Key 不能为空" }, 400);
  }

  const updates: string[] = ["updated_at = datetime('now')"];
  const bindings: unknown[] = [];
  if (body.name !== undefined) {
    updates.push("name = ?");
    bindings.push(body.name.trim());
  }
  if (body.base_url !== undefined) {
    updates.push("base_url = ?");
    bindings.push(body.base_url.trim());
  }
  if (body.api_key !== undefined) {
    updates.push("api_key_enc = ?");
    bindings.push(await encryptApiKey(env, body.api_key.trim()));
  }
  if (body.provider !== undefined) {
    updates.push("provider = ?");
    bindings.push(body.provider);
  }

  const updated = await first<ConfigRow>(
    env.DB,
    `UPDATE saved_configs SET ${updates.join(", ")}
     WHERE id = ? AND user_id = ? RETURNING *`,
    ...bindings,
    id,
    user.userId
  );
  if (!updated) throw new Error("配置更新失败");
  const plainKey = body.api_key?.trim() || await decryptApiKey(env, updated.api_key_enc);

  return json({
    config: {
      id: updated.id,
      name: updated.name,
      base_url: updated.base_url,
      api_key_masked: maskApiKey(plainKey),
      provider: updated.provider || "openai",
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    },
  });
};

export const onRequestDelete: AppFunction = async ({ request, env, params }) => {
  const user = await getSession(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const id = parseId(params.id);
  if (!id) return json({ error: "无效的配置 ID" }, 400);

  const existing = await ownedConfig(env, id, user.userId);
  if (existing instanceof Response) return existing;
  await run(env.DB, "DELETE FROM saved_configs WHERE id = ? AND user_id = ?", id, user.userId);
  return json({ success: true });
};
