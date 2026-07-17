import type { NextConfig } from "next";

// 双部署目标：Cloudflare Pages 与 Docker/Vercel 共用一份配置，按构建环境切换 output。
// - Cloudflare Pages：平台构建时自动置 CF_PAGES=1，且本地 `npm run cf:*` 脚本经 cf-build.mjs 显式设置。
//   此时输出静态导出（out/），API 由 functions/（Pages Functions + D1）提供，不需要 Node 路由处理程序。
// - Docker / Vercel / 本地 dev：CF_PAGES 未设，走 standalone，Next 的 src/app/api Node 路由生效，搭配 better-sqlite3/pg。
const isCF = process.env.CF_PAGES === "1";

const nextConfig: NextConfig = isCF
  ? {
      output: "export",
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {
      output: "standalone",
    };

export default nextConfig;
