import type { AppFunction } from "./_lib/env";
import { MissingEnvError } from "./_lib/env";
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
    // 缺环境变量：转成可读提示，方便部署排查（不泄露任何 secret 值，只说缺哪个名字）
    if (error instanceof MissingEnvError) {
      return json(
        {
          error: `未配置 ${error.name_}，请在 Cloudflare Pages 项目的 Settings → Variables and Secrets 中设置该环境变量并重新部署`,
          missing: error.name_,
        },
        500
      );
    }
    // D1 未绑定：env.DB 为 undefined 时 .prepare 会抛 TypeError，识别并给出明确提示
    if (error instanceof TypeError && /prepare|env\.DB|DB/i.test(error.message)) {
      return json(
        {
          error: "D1 数据库未绑定或绑定名不是 DB，请在 Pages 项目 Settings → Functions → D1 bindings 中绑定（变量名 DB）",
        },
        500
      );
    }
    if (error instanceof HttpError) {
      return json({ error: error.message }, error.status);
    }
    // 其它未预期错误：记录真实信息到日志，前端仍给通用提示
    console.error("Unhandled Pages Function error", error);
    const detail =
      error instanceof Error ? error.message : typeof error === "string" ? error : "unknown";
    return json({ error: "服务器内部错误", detail }, 500);
  }
};
