# MyMall 商城前端

基于 Vue 3 + TypeScript + Vite 的电商前端，配套 Spring Boot 后端（[my_mall](https://github.com/2640345221-sys/my_mall)），分用户端与管理端两套界面。

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Vue 3.5（`<script setup>`）、TypeScript、Vite |
| 状态 | Pinia |
| UI | Element Plus + icons |
| 路由 | Vue Router |
| 请求 | Axios（拦截器自动携带 Token、统一解包与错误提示） |

## 页面

- **用户端**（移动端风格）：首页 / 分类 / 商品详情与搜索 / 购物车 / 下单 / 订单与详情 / 限时秒杀 / 收货地址 / 我的与设置
- **管理端**（后台风格）：登录 / 商品管理 / 分类管理 / 首页配置（新品·热销·推荐）/ 订单管理 / 秒杀管理 / 用户管理

## 目录

```
src/
├── api/           # 按模块划分的接口（request.ts 为 Axios 封装，baseURL /api）
├── stores/        # Pinia：admin / user 状态
├── router/        # 路由（用户端 + 管理端）
├── views/
│   ├── user/      # 用户端页面
│   └── admin/     # 管理端页面
├── components/    # 公共组件
└── utils/         # 工具（价格格式化等）
```

## 快速开始

```bash
npm install
npm run dev
```

后端默认在 `http://localhost:8080`，Vite 已配置代理 `/api`、`/admin/dist`、`/upload` 转发到后端。

## 说明

- Token 自动携带：用户端存 `token`，管理端存 `adminToken`，由 Axios 请求拦截器按路径注入 `token` 头。
- 秒杀页通过轮询 `/seckill/result` 获取结果；地址/下单页有定时器卸载清理与搜索关键词落盘等细节优化。
