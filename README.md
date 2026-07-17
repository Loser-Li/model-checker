# Model Checker

一键检测第三方 AI 模型代理平台的模型可用性，快速识别哪些模型能用、哪些不能用。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-v0.1.0-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

> 输入 API Key 和 Base URL，自动拉取模型列表并逐个验证，结果一目了然。

<!-- Deploy buttons -->
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwwwhzhouhui569%2Fmodel-checker&env=JWT_SECRET,ENCRYPTION_KEY&envDescription=Required%20environment%20variables%20for%20Model%20Checker&envLink=https%3A%2F%2Fgithub.com%2Fwwwhzhouhui569%2Fmodel-checker%23environment-variables&project-name=model-checker&repository-name=model-checker)

[![Docker Pulls](https://img.shields.io/badge/docker-pull-2496ED?logo=docker)](https://hub.docker.com/r/wwwhzhouhui569/model-checker)

[![Deploy to Cloudflare](https://img.shields.io/badge/Cloudflare%20Pages-deploy-F38020?logo=cloudflare&logoColor=white)](#cloudflare-pages-部署)

---

## 项目介绍

### 项目概述

Model Checker 是一个基于 Next.js 的 Web 工具，专为使用 NewAPI / OneAPI 等第三方代理平台的用户设计。它通过 OpenAI 标准兼容接口，自动获取平台上的所有模型，并逐个发送测试请求验证可用性，帮助用户快速筛选出可正常调用的模型。

**在线体验**：https://model-checker-shkl.vercel.app/

### 快速部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwwwzhouhui569%2Fmodel-checker&env=JWT_SECRET,ENCRYPTION_KEY&envDescription=Required%20environment%20variables%20for%20Model%20Checker&envLink=https%3A%2F%2Fgithub.com%2Fwwwzhouhui569%2Fmodel-checker%23environment-variables&project-name=model-checker&repository-name=model-checker)

[![Deploy to Docker](https://img.shields.io/badge/Docker-Quick%20Deploy-2496ED?logo=docker&logoColor=white)](#docker-部署)

**Docker 快速启动**：
```bash
docker run -d \
  --name model-checker \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e JWT_SECRET=your-secret-key \
  -e ENCRYPTION_KEY=your-encryption-key \
  --restart unless-stopped \
  wwwzhouhui569/model-checker:latest
```

![image-20260228101913696](https://mypicture-1258720957.cos.ap-nanjing.myqcloud.com/image-20260228101913696.png)

### 核心功能

- **多厂商支持** — 支持 OpenAI 兼容、Anthropic (Claude)、Google Gemini 三大厂商
- **模型列表拉取** — 通过标准接口获取全部模型
- **批量可用性检测** — 并发调用逐个验证模型可用性
- **实时状态展示** — ✓ 可用 / ✗ 不可用 / ○ 待检测，进度条实时更新
- **用户系统** — 支持邮箱注册登录、GitHub / LinuxDo OAuth 授权登录
- **配置管理** — 保存常用配置，一键快速加载
- **历史记录** — 查看过往检测结果，支持对比分析
- **结果导出** — 一键复制为 Markdown 表格

### 适用场景

- **API 选型** — 测试多个代理平台，选择响应最快、最稳定的
- **模型验证** — 确认购买的 API Key 支持哪些模型
- **故障排查** — 快速定位是平台问题还是模型问题
- **成本优化** — 找出可用的免费/低价模型替代方案

---

## 功能清单

| 功能名称 | 功能说明 | 技术栈 | 更新时间 | 版本 |
|---------|---------|--------|----------|------|
| 多厂商支持 | OpenAI 兼容 / Anthropic / Gemini | TypeScript | 2026-02-28 | v0.1.0 |
| 模型列表拉取 | 调用 /v1/models 接口获取所有模型 | Next.js API | 2026-02-28 | v0.1.0 |
| 批量检测 | 3 并发队列逐个测试模型可用性 | React | 2026-02-28 | v0.1.0 |
| 单个重测 | 对任意模型单独重新检测 | React | 2026-02-28 | v0.1.0 |
| 进度条 | 实时显示检测进度和统计数据 | Tailwind CSS | 2026-02-28 | v0.1.0 |
| 邮箱认证 | 注册 / 登录 / JWT Token / bcrypt 密码哈希 | jose, bcryptjs | 2026-02-28 | v0.1.0 |
| OAuth 登录 | GitHub / LinuxDo 授权登录 | OAuth 2.0 | 2026-02-28 | v0.1.0 |
| 配置保存 | AES-256-GCM 加密存储 API Key（密钥长度自动容错） | Drizzle ORM | 2026-02-28 | v0.1.0 |
| 历史记录 | 保存检测结果，支持查看 | SQLite / PostgreSQL | 2026-02-28 | v0.1.0 |
| 自动建表 | Vercel Postgres 首次启动自动创建表 | Next.js Instrumentation | 2026-02-28 | v0.1.0 |
| URL 参数注入 | 支持 ?baseUrl=&apiKey= 快速测试 | Next.js | 2026-02-28 | v0.1.0 |
| Markdown 导出 | 复制检测结果为 Markdown 表格 | Clipboard API | 2026-02-28 | v0.1.0 |
| 响应式布局 | 适配桌面端和移动端 | Tailwind CSS | 2026-02-28 | v0.1.0 |
| 暗色主题 | 终端风格暗色 UI | CSS Variables | 2026-02-28 | v0.1.0 |
| Docker 支持 | 多阶段构建 / standalone 输出 / 数据卷挂载 | Docker | 2026-02-28 | v0.1.0 |

---

## 功能详解

### Provider 适配器模式

项目采用适配器模式统一不同厂商的 API 差异：

```
ProviderAdapter 接口
├── fetchModels()  — 获取模型列表
└── testModel()    — 测试单个模型
```

支持厂商：
- **OpenAI 兼容** — 包含 NewAPI、OneAPI 等所有第三方代理
- **Anthropic** — Claude 系列模型官方 API
- **Gemini** — Google Gemini 系列 API

### API Key 安全机制

- **传输安全** — 通过 Next.js API Route 代理转发，Key 不暴露在浏览器端
- **存储安全** — 使用 AES-256-GCM 加密存储到数据库
- **密钥长度容错** — 当 `ENCRYPTION_KEY` 不是标准 64 位 hex 字符串时，自动使用 SHA-256 hash 生成合法的 32 字节密钥，避免 "Invalid key length" 错误
- **显示脱敏** — 界面只显示末 4 位，如 `sk-****1234`

### OAuth 授权登录

项目支持 GitHub 和 LinuxDo 第三方授权登录，使用标准 OAuth 2.0 流程：

**OAuth 流程图**：
```
用户点击 OAuth 按钮
        ↓
重定向到 /api/auth/oauth/{provider}
        ↓ (设置 state cookie)
跳转到 GitHub/LinuxDo 授权页面
        ↓
用户授权后回调到 /api/auth/callback/{provider}?code=xxx&state=xxx
        ↓ (验证 state 防 CSRF)
后端用 code 换取 access token
        ↓
获取用户信息（头像、用户名、邮箱）
        ↓
创建或更新本地用户记录
        ↓
设置 JWT cookie 并重定向回首页
```

**OAuth 用户识别**：
- GitHub 用户：`oauthProvider = "github"` + `oauthId = GitHub ID`
- LinuxDo 用户：`oauthProvider = "linuxdo"` + `oauthId = external_id（GitHub ID）或本地 ID`
- 支持 OAuth 用户与邮箱用户共存

**安全特性**：
- **CSRF 防护**：state 参数存储在 httpOnly cookie 中，有效期 10 分钟
- **自动端口检测**：回调地址自动从请求中获取，支持任意端口（3000、3001 等）
- **超时重试**：GitHub OAuth 支持自动重试（最多 3 次，指数退避）
- **友好错误**：超时/网络错误时提示用户使用替代登录方式

**代码结构**：
```
src/lib/oauth/
├── types.ts      # OAuth 类型定义
├── github.ts     # GitHub OAuth 工具（授权 URL、token 交换、用户信息）
├── linuxdo.ts    # LinuxDo/Discourse OAuth 工具
└── index.ts      # 统一导出

src/app/api/auth/oauth/
├── github/route.ts       # GitHub OAuth 入口
├── linuxdo/route.ts      # LinuxDo OAuth 入口
└── callback/
    ├── github/route.ts   # GitHub 回调处理
    └── linuxdo/route.ts  # LinuxDo 回调处理
```

### URL 参数快速测试

支持直接通过 URL 参数注入配置，无需手动输入：

```
https://your-site.com?baseUrl=https://api.example.com&apiKey=sk-xxx&provider=openai
```

或使用已保存的配置 ID：

```
https://your-site.com?configId=123
```

---

## 技术栈

| 技术 | 版本 | 用途 | 官网 |
|------|------|------|------|
| Next.js | 16 | 全栈框架（App Router + Instrumentation） | [nextjs.org](https://nextjs.org) |
| React | 19 | UI 渲染 | [react.dev](https://react.dev) |
| TypeScript | 5 | 类型安全 | [typescriptlang.org](https://www.typescriptlang.org) |
| Tailwind CSS | 4 | 样式框架 | [tailwindcss.com](https://tailwindcss.com) |
| Drizzle ORM | 0.45 | 数据库 ORM（双数据库支持） | [orm.drizzle.team](https://orm.drizzle.team) |
| better-sqlite3 | 12 | SQLite 驱动（本地/Docker） | [github.com/WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| pg | 8 | PostgreSQL 驱动（Vercel） | [github.com/brianc/node-postgres](https://github.com/brianc/node-postgres) |
| jose | 6 | JWT 处理 | [github.com/panva/jose](https://github.com/panva/jose) |
| bcryptjs | 3 | 密码哈希 | [github.com/dcodeIO/bcrypt.js](https://github.com/dcodeIO/bcrypt.js) |

### 技术架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                           浏览器端 (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  ConfigForm  │  │  ModelTable  │  │  ProgressBar │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                               │ HTTP/JSON
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Next.js API Routes                            │
│  ┌───────────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  /api/models      │  │  /api/test   │  │ /api/configs │             │
│  │  /api/auth/*      │  │/api/histories│  │ /api/health  │             │
│  │  /api/auth/oauth/ │  └──────────────┘  └──────────────┘             │
│  │  /api/auth/callback/│                                          │
│  └───────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                              ▼
        ┌──────────────┐              ┌──────────────┐
        │ Provider 层   │              │  OAuth 层     │
        │ (多厂商适配)  │              │ (第三方登录)  │
        └──────────────┘              └──────────────┘
                │                              │
                └──────────────┬──────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   第三方服务层                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  OpenAI API  │  │ Anthropic API│  │Gemini API    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  GitHub OAuth│  │ LinuxDo OAuth│                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────────┘

                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      数据库层 (Drizzle ORM)                        │
│  SQLite (本地/Docker)  ←→  统一 Schema  ←→  PostgreSQL (Vercel)   │
│  users / saved_configs (AES-256-GCM 加密) / check_histories       │
└─────────────────────────────────────────────────────────────────────┘
```

### Docker 架构设计

项目采用 **Next.js Standalone 输出模式**（Docker/Vercel 目标，由 `next.config.ts` 在 `CF_PAGES` 未设时启用）配合 **多阶段构建** 实现 Docker 部署：

**多阶段构建流程**：
```
Stage 1: deps        → 安装依赖 (node_modules)
Stage 2: builder     → 编译 Next.js (standalone 输出)
Stage 3: runner      → 最小化运行时镜像
```

**关键特性**：
- **Standalone 输出**：Next.js 输出自包含的服务器包，无需 node_modules
- **原生模块编译**：better-sqlite3 在构建阶段编译，无需运行时编译
- **非 root 用户**：使用 `nextjs:nodejs` (1001:1001) 运行，提高安全性
- **健康检查**：`/api/health` 端点，30s 间隔，3 次失败后重启
- **数据持久化**：`./data:/app/data` 卷挂载，数据库文件持久化

**镜像优化**：
- 基础镜像：`node:24-alpine` (~45MB)
- 最终镜像：< 150MB (包含 SQLite 和依赖)
- 启动速度：< 1s (Turbopack 优化)

---

## 项目结构

```
model-checker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts    # 用户注册
│   │   │   │   ├── login/route.ts       # 用户登录
│   │   │   │   ├── logout/route.ts      # 用户登出
│   │   │   │   └── me/route.ts          # 获取当前用户
│   │   │   ├── models/route.ts          # 获取模型列表
│   │   │   ├── test/route.ts            # 测试单个模型
│   │   │   ├── configs/
│   │   │   │   ├── route.ts             # 配置 CRUD
│   │   │   │   └── [id]/route.ts        # 单个配置操作
│   │   │   └── histories/
│   │   │       ├── route.ts             # 历史 CRUD
│   │   │       └── [id]/route.ts        # 删除历史
│   │   ├── dashboard/page.tsx           # 用户仪表板
│   │   ├── history/page.tsx             # 历史详情页
│   │   ├── layout.tsx                   # 根布局
│   │   ├── page.tsx                     # 主检测页面
│   │   └── globals.css                  # 全局样式
│   ├── instrumentation.ts               # 服务启动钩子（Vercel Postgres 自动建表）
│   ├── components/
│   │   ├── AuthContext.tsx              # 认证状态管理
│   │   ├── AuthModal.tsx                # 登录/注册弹窗
│   │   ├── ConfigForm.tsx               # 配置输入表单
│   │   ├── ModelTable.tsx               # 模型列表表格
│   │   ├── Navbar.tsx                   # 导航栏
│   │   └── ProgressBar.tsx              # 进度条组件
│   ├── lib/
│   │   ├── providers/
│   │   │   ├── types.ts                 # Provider 接口定义
│   │   │   ├── openai.ts                # OpenAI 适配器
│   │   │   ├── anthropic.ts             # Anthropic 适配器
│   │   │   ├── gemini.ts                # Gemini 适配器
│   │   │   └── index.ts                 # Provider 工厂
│   │   ├── oauth/                        # OAuth 认证库
│   │   │   ├── types.ts                 # OAuth 类型定义
│   │   │   ├── github.ts                # GitHub OAuth 工具
│   │   │   ├── linuxdo.ts               # LinuxDo OAuth 工具
│   │   │   └── index.ts                 # 统一导出
│   │   ├── db/
│   │   │   ├── schema.ts                # 数据库表定义（统一列构建器支持双数据库）
│   │   │   └── index.ts                 # DB 连接（自动选择 SQLite 或 Postgres，移除 sslmode 参数修复 Neon SSL 问题）
│   │   ├── auth.ts                      # JWT 工具
│   │   └── crypto.ts                    # 加密工具（密钥长度自动容错）
│   └── types/
│       └── index.ts                     # 核心类型定义
├── data/
│   └── app.db                           # SQLite 数据库文件
├── public/                              # 静态资源
├── Dockerfile                           # Docker 多阶段构建配置
├── docker-compose.yml                    # Docker Compose 编排
├── .dockerignore                        # Docker 构建排除文件
├── .env.local.example                   # 本地环境变量模板
├── .env.docker.example                  # Docker 环境变量模板
├── drizzle.config.ts                    # Drizzle 配置
├── next.config.ts                       # Next.js 配置（按 CF_PAGES 切换 export / standalone）
├── package.json                         # 项目依赖
├── tsconfig.json                        # TypeScript 配置
└── CLAUDE.md                            # Claude Code 工作指南
```

---

## 安装说明

### 环境要求

- Node.js 18+
- npm 9+ 或 pnpm 8+

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/wwwhzhouhui569/model-checker.git

# 进入目录
cd model-checker

# 安装依赖
npm install
```

### 配置说明

项目使用 SQLite 本地数据库（Docker 部署），Vercel 部署使用 PostgreSQL。无需手动建表，应用启动时自动创建。生产环境建议配置以下环境变量：

```bash
# .env.local

# JWT 密钥（必需）
# 生成命令：openssl rand -base64 64
JWT_SECRET=your-jwt-secret-key-min-64-characters-long

# API Key 加密密钥（必需）
# 推荐格式：64 位 hex 字符串（openssl rand -hex 32）
# 注意：如果不是标准 64 位 hex，会自动使用 SHA-256 hash 生成合法的 32 字节密钥
ENCRYPTION_KEY=your-64-character-hex-string-for-aes-256-gcm-encryption

# OAuth 回调地址（可选，默认使用当前域名）
# 生产环境需要配置为实际域名
OAUTH_CALLBACK_URL=https://your-domain.com

# GitHub OAuth（可选，启用 GitHub 登录需要）
# 申请地址：https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# LinuxDo OAuth（可选，启用 LinuxDo 登录需要）
# 申请地址：https://connect.linuxdo/settings/applications
LINUXDO_CLIENT_ID=your_linuxdo_client_id
LINUXDO_CLIENT_SECRET=your_linuxdo_client_secret
```

生成随机密钥：
```bash
# 生成 JWT_SECRET
openssl rand -base64 64

# 生成 ENCRYPTION_KEY (64 hex chars)
openssl rand -hex 32
```

#### GitHub OAuth 申请步骤

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击「New OAuth App」
3. 填写应用信息：
   - Application name: `Model Checker`（或自定义名称）
   - Homepage URL: `http://localhost:3000`（开发环境）或 `https://your-domain.com`（生产环境）
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`（开发）或 `https://your-domain.com/api/auth/callback/github`（生产）
4. 创建后获取 `Client ID` 和 `Client Secret`
5. 将 `Client ID` 和 `Client Secret` 填入 `.env.local`

#### LinuxDo OAuth 申请步骤

1. 访问 [LinuxDo User Settings](https://connect.linuxdo/settings/applications)
2. 点击「New App」
3. 填写应用信息：
   - Application Name: `Model Checker`（或自定义名称）
   - Callback URLs: `http://localhost:3000/api/auth/callback/linuxdo`（开发）或 `https://your-domain.com/api/auth/callback/linuxdo`（生产）
4. 创建后获取 `Client ID` 和 `Client Secret`
5. 将 `Client ID` 和 `Client Secret` 填入 `.env.local`

---

## 使用说明

### 快速开始

```bash
# 启动开发服务器
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)

### 使用示例

**方式一：手动输入**

1. 选择厂商类型（OpenAI 兼容 / Anthropic / Gemini）

2. 输入 Base URL（Anthropic/Gemini 有默认值，可省略）

3. 输入 API Key

4. 点击「获取模型列表」

5. 点击「全部检测」开始批量验证

6. 查看结果，✓ 表示可用，✗ 表示不可用

   ![image-20260228102305326](https://mypicture-1258720957.cos.ap-nanjing.myqcloud.com/image-20260228102305326.png)

**方式二：已保存配置（登录后）**

1. 从「快速选择配置」下拉框选择已保存的配置
2. 系统自动加载配置并获取模型列表

**方式三：URL 参数注入**

```
https://your-site.com?baseUrl=https://api.example.com&apiKey=sk-xxx&provider=openai
```

### 高级用法

**单个模型重测**：对检测失败或想重新验证的模型，点击该行的「重测」按钮。

**导出结果**：检测完成后，点击「复制为 Markdown」按钮。

**保存配置**：检测完成后会提示保存配置，下次可快速加载。

**查看历史**：登录后访问「Dashboard」查看所有历史记录。

---

## 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 代码检查
npm run lint
```

### 构建部署

```bash
# 生产构建
npm run build

# 启动生产服务
npm run start
```

### Docker 部署

#### 方式一：使用预构建镜像（推荐）

**Docker Compose**：
```bash
# 1. 下载 docker-compose.yml
curl -O https://raw.githubusercontent.com/wwwhzhouhui569/model-checker/main/docker-compose.yml

# 2. 创建环境变量文件
cat > .env << EOF
JWT_SECRET=$(openssl rand -base64 64)
ENCRYPTION_KEY=$(openssl rand -hex 32)
EOF

# 3. 启动容器
docker-compose up -d

# 4. 查看日志
docker-compose logs -f
```

**Docker 命令**：
```bash
docker run -d \
  --name model-checker \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e JWT_SECRET=$(openssl rand -base64 64) \
  -e ENCRYPTION_KEY=$(openssl rand -hex 32) \
  --restart unless-stopped \
  wwwzhouhui569/model-checker:latest
```

#### 方式二：从源码构建

```bash
# 1. 克隆项目
git clone https://github.com/wwwhzhouhui569/model-checker.git
cd model-checker

# 2. 复制环境变量模板
cp .env.docker.example .env

# 3. 修改环境变量（必须修改 JWT_SECRET 和 ENCRYPTION_KEY）
vim .env

# 4. 构建并启动
docker-compose up -d --build
```

**Docker 命令手动构建**：
```bash
# 构建镜像
docker build -t model-checker .

# 运行容器
docker run -d \
  --name model-checker \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e JWT_SECRET=your-secret \
  -e ENCRYPTION_KEY=your-key \
  --restart unless-stopped \
  model-checker
```

**注意事项**：
- 数据库文件会保存在 `./data` 目录，请确保持久化挂载
- 首次启动会自动创建 SQLite 数据库（Docker 模式使用 SQLite，Vercel 模式使用 Postgres）
- 健康检查端点：`http://localhost:3000/api/health`
- 预构建镜像基于 `node:24-alpine`，镜像大小约 150MB
- 镜像地址：[Docker Hub](https://hub.docker.com/r/wwwhzhouhui569/model-checker)

### 数据库操作

```bash
# 生成迁移文件
npx drizzle-kit generate

# 执行迁移
npx drizzle-kit migrate

# 打开数据库管理界面
npx drizzle-kit studio
```

### Cloudflare Pages 部署

除 Docker / Vercel 外，项目还支持部署到 **Cloudflare Pages**：前端为 Next.js 静态导出（`out/`），后端 API 由 `functions/` 目录下的 Pages Functions 提供，数据存储使用 Cloudflare D1（SQLite），全部运行在边缘运行时。

> **关于双目标**：仓库同时维护两套后端——Docker/Vercel 走 Node 运行时（`src/app/api` + better-sqlite3/pg + bcrypt），Cloudflare Pages 走边缘运行时（`functions/` + D1 + Web Crypto + PBKDF2）。`next.config.ts` 根据 `CF_PAGES` 环境变量自动切换 `output`（CF→`export`，其余→`standalone`）。两者用户库相互独立；本项目按全新部署处理，**不迁移旧用户**（Docker 用 bcrypt、CF 用 PBKDF2，密码哈希格式不可互认）。JWT 与 API Key 加密在相同 `JWT_SECRET` / `ENCRYPTION_KEY` 下跨运行时兼容。

#### 方式一：命令行手动部署（`wrangler` CLI）

适合本地操作、CI，或不想绑 Git 仓库的场景。

**前置条件**

- **Node.js ≥ 20.9**（Next.js 16 要求；用 `node -v` 检查，老版本可用 nvm 切换）
- 已安装依赖：`npm install`
- 已登录 Cloudflare：`npx wrangler login`（浏览器授权一次即可，凭据缓存在 `wrangler`）
- 一个 Cloudflare 账号（免费套餐即可，D1/Pages 都有免费额度）

**第 1 步：创建 D1 数据库**

```bash
npx wrangler d1 create model-checker
```

命令会输出类似：

```
✅ Successfully created DB 'model-checker'
[[d1_databases]]
binding = "DB"
database_name = "model-checker"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"   # ← 复制这个 ID
```

把返回的 `database_id` 填进项目根的 `wrangler.toml`（替换 `<填入 wrangler d1 create model-checker 的返回 ID>` 占位符），`binding`/`database_name` 保持 `DB` / `model-checker` 不变。

**第 2 步：初始化远程 D1 表结构**

```bash
npm run db:remote:init
# 等价于：wrangler d1 execute model-checker --remote --file=migrations/0001_initial.sql
```

这会建 `users` / `saved_configs` / `check_histories` 三张表。重复执行无害（用的是 `CREATE TABLE IF NOT EXISTS`）。

**第 3 步：创建 Pages 项目**

```bash
npx wrangler pages project create model-checker --production
```

> 也可以跳过这步，直接在第 4 步第一次 `cf:deploy` 时按提示创建。但先建好方便绑 secret。

**第 4 步：设置环境变量（secret）**

必填 2 个、OAuth 可选 4 个。每条命令回车后会在终端提示你输入对应值（输入时不回显，输完回车）：

```bash
# —— 必填 ——
npx wrangler pages secret put JWT_SECRET      --project-name=model-checker
#   建议用 openssl rand -base64 64 生成 ≥64 字符的随机串

npx wrangler pages secret put ENCRYPTION_KEY  --project-name=model-checker
#   建议 64 位 hex：openssl rand -hex 32（非标长度会自动 SHA-256 派生，仍可用）

# —— 可选（启用 GitHub / LinuxDo OAuth 登录时）——
npx wrangler pages secret put GITHUB_CLIENT_ID      --project-name=model-checker
npx wrangler pages secret put GITHUB_CLIENT_SECRET  --project-name=model-checker
npx wrangler pages secret put LINUXDO_CLIENT_ID      --project-name=model-checker
npx wrangler pages secret put LINUXDO_CLIENT_SECRET  --project-name=model-checker

# —— 可选（自定义域名时；不设则自动从请求来源推导回调地址）——
npx wrangler pages secret put OAUTH_CALLBACK_URL    --project-name=model-checker
#   例：https://model-checker.pages.dev 或你的自定义域名
```

> 也可在 Cloudflare 控制台操作：Workers & Pages → 你的项目 → Settings → Environment variables（Production）逐个添加。secret 与普通变量的区别：secret 写入后不可再读回明文，更安全。

**第 5 步：构建并部署**

```bash
npm run cf:deploy
# 等价于：node scripts/cf-build.mjs && wrangler pages deploy out --project-name=model-checker
```

`cf:build` 会临时把 Node 端的 `src/app/api` 移出构建树（静态导出不兼容路由处理程序，CF 的 API 由 `functions/` 提供），构建完自动还原。产物为 `out/` 纯静态前端 + `functions/` 边缘函数，由 `wrangler pages deploy` 一起上传。

部署成功后终端会给出一个 `https://<commit>.model-checker.pages.dev` 预览地址，以及生产地址 `https://model-checker.pages.dev`。

**第 6 步：验证**

```bash
# 健康检查（应返回 {"database":"d1"} 之类）
curl https://model-checker.pages.dev/api/health
```

打开站点，注册一个账号、保存一个配置、跑一次检测，确认 D1 读写正常。OAuth 若配了 secret，记得在 GitHub/LinuxDo 的 OAuth App 里把回调地址设为 `https://<你的pages域名>/api/auth/callback/github` 与 `…/linuxdo`。

#### 方式二：Git 集成自动部署（推荐生产用法）

把仓库连到 Cloudflare Pages，每次 `git push` 自动构建部署，无需本地装 Node/wrangler。

1. Cloudflare 控制台 → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. 授权并选择你的 GitHub 仓库（如 `Loser-Li/-model-checker`）
3. 构建设置：
   - **Framework preset**：`Next.js`（或 None，不影响，因为我们是静态导出）
   - **Build command**：`npm run cf:build`
   - **Build output directory**：`out`
   - **Root directory**：留空
4. **Environment variables**（Settings → Environment variables，Production 与 Preview 都加）：
   - `JWT_SECRET`、`ENCRYPTION_KEY`（必填）
   - `GITHUB_CLIENT_ID/SECRET`、`LINUXDO_CLIENT_ID/SECRET`（可选）
   - `OAUTH_CALLBACK_URL`（可选）
   - 不需要手动设 `CF_PAGES`——平台构建时会自动置 `CF_PAGES=1`
5. **D1 绑定**：同样在 Settings → **Functions** → **D1 database bindings** 里把数据库 `model-checker` 绑定为变量名 `DB`（Production 与 Preview 都要绑）
6. 保存 → 触发一次部署。之后每次 `git push main` 自动部署生产；push 其他分支生成 Preview 部署。

> Git 集成方式下，`wrangler.toml` 里的 `database_id` 不参与平台构建绑定（那是 CLI 部署用的），控制台 D1 binding 才是 Git 集成时的绑定来源。两种方式只要保证绑定名都叫 `DB` 即可。

#### 本地预览（不部署，先验证）

```bash
# 本地 D1 建表 + 静态构建 + wrangler pages dev（带本地 D1 绑定 DB）
npm run cf:dev

# 健康检查
curl http://localhost:8788/api/health   # 返回 {"database":"d1", ...}
```

本地 secret 写入项目根的 `.dev.vars`（格式同 `.env`，已被 `.gitignore` 忽略），`wrangler pages dev` 会自动加载：

```bash
# .dev.vars 示例
JWT_SECRET=dev-only-not-for-production-...
ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000
```

#### 常见部署报错

| 现象 | 原因与处理 |
|---|---|
| `You are using Node.js 16.x ... >=20.9.0 required` | 本地 Node 太旧，用 nvm 升到 20+；CF Pages 自带 Node 20+，不用担心 |
| `Cannot find module '@tailwindcss/oxide-<platform>'` | Tailwind v4 平台二进制没装上，`npm install` 重试；CI 上确认没 `--no-optional` |
| `/api/health` 返回 500 / `DB is undefined` | D1 未绑定或绑定名不是 `DB`；CLI 方式检查 `wrangler.toml` 的 `database_id`，Git 方式在控制台 Functions → D1 bindings 加 `DB` |
| 构建报 `force-static not configured on route /api/...` | 没走 `cf:build` 而是直接 `next build` 且设了 `CF_PAGES=1`；务必用 `npm run cf:build`（它会把 `src/app/api` 临时移出） |
| `wrangler pages deploy` 提示找不到项目 | 没建项目，先 `npx wrangler pages project create model-checker --production` |
| OAuth 回调跳错地址 | 没设 `OAUTH_CALLBACK_URL` 导致用了请求来源推导；设成正式 `https://<pages域名>` |

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/xxx`)
3. 提交变更 (`git commit -m 'Add xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 提交 Pull Request

---

## 常见问题

<details>
<summary>获取模型列表失败怎么办？</summary>

1. 检查 Base URL 是否正确，确保包含协议前缀 `https://`
2. 检查 API Key 是否有效
3. 确认第三方平台是否正常运行
4. 查看浏览器控制台的错误信息
5. Anthropic/Gemini 可尝试不填 Base URL 使用默认值

</details>

<details>
<summary>部分模型检测失败是什么原因？</summary>

常见原因：
- **HTTP 401/403**：API Key 无权限访问该模型
- **HTTP 429**：触发了平台限流，稍后重试
- **HTTP 500**：上游模型服务异常
- **请求超时（30s）**：模型响应过慢或不可用
- **响应中无有效内容**：模型不支持 chat 接口（如 embedding 模型）

</details>

<details>
<summary>检测会消耗多少 Token？</summary>

每个模型的测试请求发送 `"hi"` 并限制 `max_tokens=5`，消耗极少。按 100 个模型估算，总消耗不超过 1000 tokens。

</details>

<details>
<summary>支持哪些平台？</summary>

支持所有兼容 OpenAI 标准接口的平台，包括但不限于：
- NewAPI / OneAPI 等聚合代理平台
- OpenAI 官方 API
- 各类 OpenAI 反向代理
- Anthropic Claude 官方 API
- Google Gemini 官方 API

</details>

<details>
<summary>数据库文件在哪里？</summary>

- **本地开发 / Docker 部署**：SQLite 数据库文件位于 `./data/app.db`，首次运行自动创建。如需重置，删除该文件即可。
- **Vercel 部署**：使用 Vercel Postgres（Neon），数据库由 Vercel 托管。
  - 表在首次启动时通过 `src/instrumentation.ts` 自动创建（使用 Next.js instrumentation hook）
  - 检测到 `users` 表已存在时会跳过创建，避免重复初始化
  - 移除了连接 URL 中的 `sslmode` 参数，使用 `ssl: { rejectUnauthorized: false }` 解决 Neon SSL 证书验证问题

</details>

<details>
<summary>如何部署到生产环境？</summary>

**Vercel 部署（推荐）**：

项目已原生支持 Vercel + Postgres 部署，数据库表在首次启动时自动创建。

1. Fork 本仓库到你的 GitHub
2. 在 Vercel 创建新项目并关联仓库
3. 在 Vercel 项目设置中添加 Postgres 数据库（Storage → Create Database → Postgres）
4. 配置环境变量：`JWT_SECRET`、`ENCRYPTION_KEY`（可选：OAuth 相关变量）
5. 部署即可

或使用一键部署按钮：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwwwzhouhui%2Fmodel-checker&env=JWT_SECRET,ENCRYPTION_KEY&envDescription=Required%20environment%20variables%20for%20Model%20Checker&project-name=model-checker&repository-name=model-checker)

**传统服务器部署**：
```bash
npm run build
npm run start
```

**Cloudflare Pages 部署**：见上文 [Cloudflare Pages 部署](#cloudflare-pages-部署) 小节。前端静态导出 + Pages Functions（D1）边缘运行时。

</details>

---

