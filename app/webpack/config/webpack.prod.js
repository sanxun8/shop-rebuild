const path = require("path");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin");
const HTMLWebpackInjectAttributesPlugin = require("html-webpack-inject-attributes-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

// 基类配置
const baseConfig = require("./webpack.base.js");

// 生产环境 webpack 配置
const webpackConfig = merge.smart(
  {
    // 指定生产环境
    mode: "production",
    // 生产环境 output 配置
    output: {
      filename: "js/[name]_[chunkhash:8].bundle.js",
      // filename: "js/[name]_[chunkhash:8].bundle.js",
      path: path.join(process.cwd(), "./app/public/dist/prod/"),
      publicPath: "/dist/prod/",
      crossOriginLoading: "anonymous",
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader],
        },
      ],
    },
    // webpack 不会有大量 hints 信息, 默认为 warning
    performance: {
      hints: false,
    },
    plugins: [
      // 每次 build 前, 清空 public/dist 目录
      new CleanWebpackPlugin(),
      // 提取 css 公共部分, 有效利用缓存, (非公共部分利用 inline)
      new MiniCssExtractPlugin({
        chunkFilename: "css/[name]_[contenthash:8].bundle.css",
      }),
      // 优化并压缩 css 资源
      new CssMinimizerWebpackPlugin(),
      // 浏览器在请求资源时, 不发送用户的身份凭证
      new HTMLWebpackInjectAttributesPlugin({
        crossorigin: "anonymous",
      }),
    ],
    optimization: {
      // 使用 TerserPlugin 的并发和缓存, 提升压缩阶段性能
      // 清除 console.log
      minimize: true,
      minimizer: [
        new TerserWebpackPlugin({
          terserOptions: {
            compress: {
              drop_console: true, // 去掉 console.log 内容
            },
          },
        }),
      ],
    },
  },
  baseConfig
);

module.exports = webpackConfig;
