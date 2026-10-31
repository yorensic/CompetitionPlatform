# 🏆 校园竞赛信息平台 V1.0

基于原生 HTML / CSS / JavaScript 开发的“深空科技风”大学生竞赛信息聚合平台。采用数据与视图分离架构，具备完善的多维筛选、图表联动与信息展示功能。

## 🚀 快速启动
直接克隆仓库，使用 VS Code 的 Live Server 插件运行 `index.html` 即可。数据位于 `data/data.json`，前端通过 Fetch 异步加载，无需部署后端服务。

## 📂 整体结构图
```text
CompetitionPlatform/
├── css/
│   └── style.css       # 核心样式：深空黑背景、毛玻璃卡片、交互动效
├── data/
│   └── data.json       # 数据源：30条真实比赛，JS自动扩充至84项
├── js/
│   └── app.js          # 核心逻辑：四维交叉筛选、ECharts图表联动、弹窗
└── index.html          # 骨架：包含四大核心模块的页面结构