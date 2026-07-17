import type { AppFunction } from "./_lib/env";
import { HttpError, json } from "./_lib/http";

export const onRequest: AppFunction = async (context) => {
  try {
    const response = await context.next();
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: error.message }, error.status);
    }
    console.error("Unhandled Pages Function error", error);
    return json({ error: "服务器内部错误" }, 500);
  }
};
