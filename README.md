# @windaka/erp-cli

物达通（WindaKa）物业管理 ERP 系统命令行工具。

## 安装

```bash
npm install -g @windaka/erp-cli
```

## 快速开始

```bash
# 初始化配置
erp-cli --as me config init

# 登录
erp-cli --as me auth login

# 查看状态
erp-cli --as me auth status
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

## 要求

- Node.js >= 14.0.0
- 支持 Windows (x64/arm64)、macOS (x64/arm64)、Linux (x64/arm64)

## License

MIT