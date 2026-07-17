import type { AppFunction } from "../_lib/env";
import { json } from "../_lib/http";

export const onRequestGet: AppFunction = async ({ env }) => {
  await env.DB.prepare("SELECT 1").first();
  return json({ status: "ok", database: "d1", timestamp: new Date().toISOString() });
};
