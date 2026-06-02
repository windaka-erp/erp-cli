# 物达通 ERP CLI 安装指南

以下步骤面向 AI Agent。

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

## 第 2 步 验证

```shell
erp-cli --help
```

安装完成。使用时通过 Skill 读取 [skills/SKILL.md](./skills/SKILL.md) 获取命令指南，登录会在需要时自动引导。