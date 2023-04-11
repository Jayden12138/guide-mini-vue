# 一、jest&ts 环境搭建

1. yarn init -y
2. yarn add typescript --dev
3. npx tsc --init // 使用tsc初始化一个tsconfig文件
4. yarn add jest @types/jest --dev

debug报错
https://jestjs.io/docs/getting-started#using-babel
https://jestjs.io/docs/getting-started#using-typescript



# 目录结构
├── packages/
│   ├── compiler-core/          # 编译器核心
│   ├── compiler-dom/           # 编译器的 DOM 部分
│   ├── reactivity/             # 响应式系统
│   ├── runtime-core/           # 运行时核心
│   ├── runtime-dom/            # 运行时的 DOM 部分
│   ├── server-renderer/        # 服务器端渲染
│   ├── shared/                 # 共享的工具方法
│   ├── size-sensor/            # 尺寸感知插件
│   ├── template-explorer/      # 模板探索工具
│   ├── vue/                    # 入口文件和构建脚本
│   └── ...                     # 其他模块和插件
├── scripts/                     # 构建脚本
├── test/                        # 测试代码
├── packages.json                # 依赖文件
├── README.md                    # 项目说明文档
