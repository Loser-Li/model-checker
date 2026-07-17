// Cloudflare Pages 构建入口（`npm run cf:build`）。
//
// 为什么需要这个脚本而不是直接 `next build`：
// next.config.ts 在 CF_PAGES=1 时使用 output:"export"（静态导出到 out/）。但 Next.js 的静态导出
// 与 App Router 的路由处理程序（src/app/api/**/route.ts）不兼容——收集页面数据阶段会抛错
// （"export const dynamic = 'force-static' ... not configured on route ... with output: export"）。
// 而 Cloudflare Pages 上 API 由 functions/（Pages Functions + D1）提供，根本不需要 src/app/api/**。
//
// 做法：构建前把 src/app/api 整个移出 App Router 路由树与 TS 检查范围——移到项目根的 .cf-stash/api
// （.cf-stash 已在 tsconfig exclude 与 .gitignore 中），跑完 next build 后在 finally 中还原。
// 注意：不能只改名为 src/app/_api_legacy，Next 16 的 TS 检查与页面数据收集仍会遍历 `_` 前缀目录，
// 必须移出 src/app/ 才能彻底脱离 App Router。

import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync, renameSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const API_DIR = resolve(ROOT, "src/app/api");
const STASH_DIR = resolve(ROOT, ".cf-stash");
const STASHED_API = resolve(STASH_DIR, "api");
// 直接用当前 node 运行 next 的 CLI 入口，避免 spawnSync 调 npx/npx.cmd（Windows 下 spawn
// .cmd 需 shell:true，易触发 EINVAL）。cf-build 总是用 node 22+ 运行，process.execPath 即该 node。
const NEXT_BIN = resolve(ROOT, "node_modules/next/dist/bin/next");

function restoreIfStranded() {
  // 上次构建崩溃可能残留 .cf-stash/api，启动时先还原，避免遗留状态。
  if (existsSync(STASHED_API)) {
    if (existsSync(API_DIR)) {
      // 两个都在——异常状态，不动手以免覆盖，报错交给人工处理。
      console.error(
        `[cf-build] 异常：${API_DIR} 与 ${STASHED_API} 同时存在。请人工检查后删除 ${STASHED_API} 再构建。`
      );
      process.exit(1);
    }
    renameSync(STASHED_API, API_DIR);
    console.log("[cf-build] 检测到上次崩溃残留的 .cf-stash/api，已自动还原 src/app/api。");
  }
}

restoreIfStranded();

// 确保 next.config.ts 走 export 分支（平台通常已设，本地手动构建时兜底）。
process.env.CF_PAGES = "1";

// 暂时把 Node API 路由移出 App Router 与 TS 检查范围。
mkdirSync(STASH_DIR, { recursive: true });
renameSync(API_DIR, STASHED_API);
console.log("[cf-build] 已临时移出 src/app/api → .cf-stash/api（构建后还原）。");

let exitCode = 0;
try {
  const result = spawnSync(process.execPath, [NEXT_BIN, "build"], {
    stdio: "inherit",
    cwd: ROOT,
    env: { ...process.env, CF_PAGES: "1" },
  });
  if (result.error) {
    console.error("[cf-build] 启动 next build 失败：", result.error.message);
    exitCode = 1;
  } else {
    exitCode = result.status ?? 1;
  }
} finally {
  // 无论构建成功与否都还原目录。
  if (existsSync(STASHED_API)) {
    if (existsSync(API_DIR)) {
      console.warn("[cf-build] 警告：src/app/api 已存在，跳过还原 .cf-stash/api，请人工检查。");
    } else {
      renameSync(STASHED_API, API_DIR);
      console.log("[cf-build] 已还原 src/app/api。");
    }
  }
  // 清理空的 stash 目录。
  if (existsSync(STASH_DIR)) {
    try {
      rmSync(STASH_DIR, { recursive: true });
    } catch {
      /* 忽略，留着无害（已 gitignore） */
    }
  }
}

if (exitCode !== 0) {
  console.error(`[cf-build] next build 失败，退出码 ${exitCode}。src/app/api 已还原。`);
  process.exit(exitCode);
}

console.log("[cf-build] Cloudflare Pages 导出构建完成，产物在 out/。");
