# ad-mcp-console / apps/api

`apps/api` 是 mcp-console 的后端服务，基于 NestJS + Prisma + SQLite。

它负责：

- 管理 MCP Server 连接
- 执行 capability discovery 并保存快照
- 执行 tool 调用并记录 runs / run events
- 管理 tool policy、recipes、share links、audit logs
- 提供给 `apps/web` 使用的 REST API 和 Swagger 文档

## 技术栈

- NestJS
- TypeScript
- Prisma
- SQLite
- Zod
- Swagger
- Pino
- nestjs-i18n

## 当前目录职责

```txt
apps/api
├─ prisma/                 # Prisma schema 与 migrations
├─ src/
│  ├─ common/              # 通用基础设施：config / logger / request / http / i18n
│  ├─ generated/           # Prisma Client 生成产物
│  ├─ modules/             # 业务模块
│  │  ├─ health/
│  │  └─ prisma/
│  ├─ app.module.ts
│  └─ main.ts
├─ test/
├─ .env.example
└─ package.json
```
