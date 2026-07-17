import { getSession } from "../../_lib/auth";
import { first, run, type HistoryRow } from "../../_lib/db";
import type { AppFunction } from "../../_lib/env";
import { json, parseId } from "../../_lib/http";

async function ownedHistory(
  env: Parameters<AppFunction>[0]["env"],
  id: number,
  userId: number
): Promise<HistoryRow | Response> {
  const row = await first<HistoryRow>(env.DB, "SELECT * FROM check_histories WHERE id = ?", id);
  if (!row) return json({ error: "历史记录不存在" }, 404);
  if (row.user_id !== userId) return json({ error: "无权访问此记录" }, 403);
  return row;
}

export const onRequestGet: AppFunction = async ({ request, env, params }) => {
  const user = await getSession(request, env);
  if (!user) return json({ error: "未登录" }, 401);
  const id = parseId(params.id);
  if (!id) return json({ error: "无效的 ID" }, 400);

  const history = await ownedHistory(env, id, user.userId);
  if (history instanceof Response) return history;
  return json({
    history: {
      id: history.id,
      userId: history.user_id,
      configId: history.config_id,
      configName: history.config_name,
      baseUrl: history.base_url,
      total: history.total,
      success: history.success,
      failed: history.failed,
      resultsJson: history.results_json,
      createdAt: history.created_at,
    },
  });
};

export const onRequestDelete: AppFunction = async ({ request, env, params }) => {
  const user = await getSession(request, env);
  if (!user) return json({ error: "未登录" }, 401);
  const id = parseId(params.id);
  if (!id) return json({ error: "无效的 ID" }, 400);

  const history = await ownedHistory(env, id, user.userId);
  if (history instanceof Response) return history;
  await run(env.DB, "DELETE FROM check_histories WHERE id = ? AND user_id = ?", id, user.userId);
  return json({ success: true });
};
