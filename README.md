# @windaka-erp/erp-cli

物达通（WindaKa）物业管理 ERP 系统命令行工具，为人类和 AI Agent 设计。

## 安装

以下两种方式**任选其一**：

**方式一 — 从 npm 安装（推荐）：**

```bash
# 安装 CLI
npm install -g @windaka-erp/erp-cli

# 安装 Skills（必需，让 AI Agent 知道如何使用 CLI）
npx skills add windaka-erp/erp-cli -y -g
```

**方式二 — 从源码安装：**

```bash
git clone https://github.com/windaka-erp/erp-cli.git
cd erp-cli
go build -o erp-cli .

# 安装 Skills（必需）
npx skills add windaka-erp/erp-cli -y -g
```

## 快速开始

### 人类用户

```bash
# 1. 初始化配置
erp-cli --as me config init

# 2. 登录
erp-cli --as me auth login

# 3. 开始使用
erp-cli --as me workorder +list
```

### AI Agent

> 以下步骤面向 AI Agent，部分步骤需要用户在浏览器中配合完成。详细步骤见 [INSTALL.md](./INSTALL.md)。

**第 1 步 — 安装**

```bash
# 安装 CLI
npm install -g @windaka-erp/erp-cli

# 安装 Skills（必需）
npx skills add windaka-erp/erp-cli -y -g
```

**第 2 步 — 配置**

```bash
erp-cli --as <id> config init
```

**第 3 步 — 登录**

> 后台运行，提取授权链接发给用户在浏览器中完成。

```bash
erp-cli --as <id> auth login-start
erp-cli --as <id> auth login-wait
```

**第 4 步 — 验证**

```bash
erp-cli --as <id> auth status
```

## 命令

```
erp-cli --as <id> config init/show/set/remove      # 配置管理
erp-cli --as <id> auth login/login-start/login-wait # 登录
erp-cli --as <id> auth status/logout/list           # 认证状态
erp-cli --as <id> api GET/POST <path>               # 原始 API 调用
erp-cli --as <id> knowledge +search/+list-datasets  # 知识库检索
erp-cli --as <id> workorder +list/+create           # 工单操作
```

## 参数

- `--as <id>` — 用户标识（必填），企业微信用 Sender ID，本地用任意稳定标识（如 `me`）
- `--dry-run` — 预览请求内容，不实际执行

## Agent Skills

| Skill | 说明 |
|-------|------|
| `erp-cli` | ERP 系统总入口：知识库检索、工单管理、认证配置、意图路由 |

安装 Skills 后，AI Agent 会自动读取 [skills/SKILL.md](./skills/SKILL.md) 获取完整的使用指南。

## 要求

- Node.js >= 14.0.0
- 支持 Windows (x64/arm64)、macOS (x64/arm64)、Linux (x64/arm64)

## License

MIT