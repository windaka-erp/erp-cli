# 物达通 ERP CLI 安装指南

以下步骤面向 AI Agent，部分步骤需要用户在浏览器中配合完成。

## 环境要求

开始安装之前，请确保环境中已安装：

- Node.js（npm/npx）

## 第 1 步 安装

```shell
# 安装 CLI
npm install -g @windaka-erp/erp-cli

# 安装 CLI SKILL（必需）
npx skills add windaka-erp/erp-cli -y -g
```

## 第 2 步 配置

```shell
erp-cli --as me config init
```

## 第 3 步 登录

Agent 运行以下命令，提取授权链接发给用户在浏览器中完成。

```shell
# 启动登录，获取授权链接
erp-cli --as me auth login-start

# 等待用户完成授权
erp-cli --as me auth login-wait
```

## 第 4 步 验证

```shell
erp-cli --as me auth status
```

更多命令和能力指南，可参考 [skills/SKILL.md](./skills/SKILL.md)。