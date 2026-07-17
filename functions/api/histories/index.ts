import { getSession } from "../../_lib/auth";
import { all, first, type HistoryRow } from "../../_lib/db";
import type { AppFunction } from "../../_lib/env";
import { json, readJson } from "../../_lib/http";

interface HistoryBody {
  config_id?: number | null;
  config_name?: string;
  base_url?: string;
  total?: number;
  success?: number;
  failed?: number;
  results_json?: string;
}

interface HistoryListRow {
  id: number;
  configId: number | null;
  configName: string;
  baseUrl: string;
  total: number;
  success: number;
  failed: number;
  createdAt: string;
}

export const onRequestGet: AppFunction = async ({ request, env }) => {
  const user = await getSession(request, env);
  if (!user) return json({ error: "未登录" }, 401);

  const url = new URL(request.url);
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(url.searchParams.get("limit") || "20", 10) || 20)
  );
  const search = url.searchParams.get("search")?.trim() || "";
  const offset = (page - 1) * limit;
  const searchClause = search ? " AND config_name LIKE ?" : "";
  const searchBindings = search ? [`%${search}%`] : [];

  const countRow = await first<{ total: number }>(
    env.DB,
    `SELECT COUNT(*) AS total FROM check_histories WHERE user_id = ?${searchClause}`,
    user.userId,
    ...searchBindings
  );
  const total = Number(countRow?.total || 0);
  const histories = await all<HistoryListRow>(
    env.DB,
    `SELECT id, config_id AS configId, config_name AS configName,
            base_url AS baseUrl, total, success, failed, created_at AS createdAt
     FROM check_histories
     WHERE user_id = ?${searchClause}
     ORDER BY created_at DESC, id DESC
     LIMIT ? OFFSET ?`,
    user.userId,
    ...searchBindings,
    limit,
    offset
  );

  return json({
    histories,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const onRequestPost: AppFunction = async ({ request, env }) => {
  const user = await getSession(request, env);
  if (!user) return json({ error: "未登录" }, 401);
  const body = await readJson<HistoryBody>(request);

  if (!body.config_name?.trim() || !body.base_url?.trim()) {
    return json({ error: "config_name 和 base_url 不能为空" }, 400);
  }
  if (
    !Number.isInteger(body.total) ||
    !Number.isInteger(body.success) ||
    !Number.isInteger(body.failed)
  ) {
    return json({ error: "total、success、failed 必须是整数" }, 400);
  }
  if (!body.results_json) return json({ error: "results_json 不能为空" }, 400);

  const history = await first<HistoryRow>(
    env.DB,
    `INSERT INTO check_histories
      (user_id, config_id, config_name, base_url, total, success, failed, results_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING *`,
    user.userId,
    body.config_id ?? null,
    body.config_name.trim(),
    body.base_url.trim(),
    body.total,
    body.success,
    body.failed,
    body.results_json
  );
  if (!history) throw new Error("历史记录创建失败");

  return json({
    history: {
      id: history.id,
      configName: history.config_name,
      baseUrl: history.base_url,
      total: history.total,
      success: history.success,
      failed: history.failed,
      createdAt: history.created_at,
    },
  });
};
