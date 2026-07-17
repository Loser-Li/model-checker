import { clearTokenCookie } from "../../_lib/auth";
import type { AppFunction } from "../../_lib/env";
import { json } from "../../_lib/http";

export const onRequestPost: AppFunction = async ({ request }) =>
  json({ ok: true }, 200, { "Set-Cookie": clearTokenCookie(request) });
