# MedCase 医生端前端

全新的医生端前端工程，技术栈与管理端保持一致：

- Vue 3
- Element Plus
- Vite
- Yarn

## 环境

建议使用 Node.js `22.23.2`：

```bash
nvm use 22.23.2
```

## 安装依赖

```bash
yarn install
```

## 本地运行

```bash
yarn dev
```

本地开发端口由 Vite 自动分配；如果默认端口被占用，会自动尝试下一个可用端口。
开发代理地址需要在 `.env.development` 里配置 `VITE_DEV_SERVER_PROXY`。
后端访问前缀按环境配置在各 `.env.*` 文件的 `VITE_APP_BASE_API` 中，当前示例包含 `/medcase` context-path。

## 预发布构建

```bash
yarn build:stage
```

## 生产构建

```bash
yarn build:prod
```
