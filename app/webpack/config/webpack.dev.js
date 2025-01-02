const path = require("path");
const merge = require("webpack-merge");
const webpack = require("webpack");

// 基类配置
const baseConfig = require("./webpack.base.js");

// dev-server 配置
const DEV_SERVER_CONFIG = {
  HOST: "127.0.0.1",
  PORT: 9002,
  HMR_PATH: "__webpack_hmr", // 官方指定
  TIMEOUT: 20000,
};
const { HOST, PORT, HMR_PATH, TIMEOUT } = DEV_SERVER_CONFIG;

// 开发阶段的 entry 配置需要加入 hmr
Object.keys(baseConfig.entry).forEach((v) => {
  // 第三方包不作为 hmr 入口
  if (v !== "vendor") {
    baseConfig.entry[v] = [
      // 主入口文件
      baseConfig.entry[v],
      // hmr 更新入口, 官方指定的 hmr 路径
      `webpack-hot-middleware/client?path=http://${HOST}:${PORT}/${HMR_PATH}?timeout=${TIMEOUT}&reload=true`,
    ];
  }
});

// 开发环境 webpack 配置
const webpackConfig = merge(baseConfig, {
  // 指定生产环境
  mode: "development",
  // sourece-map 开发工具, 呈现代码的映射关系, 便于在开发过程中调试代码
  devtool: "source-map",
  // devtool: "eval-cheap-module-source-map",
  // 开发环境 output 配置
  output: {
    filename: "js/[name]_[chunkhash:8].bundle.js",
    path: path.join(process.cwd(), "./app/public/dist/dev"), // 输出文件存储路径
    publicPath: `http://${HOST}:${PORT}/${HMR_PATH}/public/dist/dev/`, // 外部资源路径
    globalObject: "this",
  },
  // 开发阶段插件
  plugins: [
    // HotModuleReplacementPlugin 用于实现热模块替换 (Hot Module Replacement 简称 HMR)
    // 热模块替换允许在应用程序运行时替换模块
    // 极大提升开发效率, 因为能让应用程序一直保持运行状态
    new webpack.HotModuleReplacementPlugin({
      multiSep: false,
    }),
  ],
});

module.exports = {
  // webpack 配置
  webpackConfig,
  // devServer 配置, 暴露给 dev.js 使用
  DEV_SERVER_CONFIG,
};
