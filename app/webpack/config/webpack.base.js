const glob = require("glob");
const path = require("path");
const webpack = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const HTMLWebpackPlugin = require("html-webpack-plugin");

const pageEntries = {};
const htmlWebpackPluginList = [];

// 获取 app/pages 目录下所有入口文件 (xxx.entry.js)
const entryList = path
  .resolve(process.cwd(), "./app/pages/**/*.entry.js")
  .replace(/\\/g, "/");

glob.sync(entryList).forEach((file) => {
  const entryName = path.basename(file, ".js");
  // 构造 entry
  pageEntries[entryName] = file;

  // 构造最终渲染的页面文件
  htmlWebpackPluginList.push(
    // html-webpack-plugin 辅助注入打包后的 bundle 文件到 html 文件中
    new HTMLWebpackPlugin({
      // 产物 (最终模板) 输出路径
      filename: path.resolve(
        process.cwd(),
        "./app/public/dist/",
        `${entryName}.ejs`
      ),
      // 指定使用的模板文件
      template: path.resolve(process.cwd(), "./app/view/entry.ejs"),
      // 要注入的代码块
      chunks: [entryName],
    })
  );
});

/**
 * webpack 基础配置
 */
module.exports = {
  // 入口配置
  entry: pageEntries,
  // 模块解析配置(决定了要加载解析哪些模块, 以及用什么方式去解析)
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: "vue-loader",
        },
      },
      {
        test: /\.js$/,
        // 只对业务代码进行 babel, 加快 webpack 打包速度
        include: [path.resolve(process.cwd(), "./app/pages")],
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(png|jpe?g|gif)(\?.+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 300,
            esModule: false,
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S)?$/,
        use: ["file-loader"],
      },
    ],
  },
  // 产物输出路径, 因为开发和生成环境不一致, 所以在各自环境中自行配置
  output: {},
  // 配置模块解析的具体行为(定义 webpack 在打包时, 如何找到并解析具体模块的路径)
  resolve: {
    extensions: [".js", ".vue", ".less", ".css"],
    alias: {
      $pages: path.resolve(process.cwd(), "./app/pages"),
      $common: path.resolve(process.cwd(), "./app/pages/common"),
      $widgets: path.resolve(process.cwd(), "./app/pages/widgets"),
      $store: path.resolve(process.cwd(), "./app/pages/store"),
    },
  },
  // 配置 webpack 插件
  plugins: [
    // 处理 .vue 文件, 这个插件是必须的
    // 它的职能是将你定义过的其他规则复制并应用到 .vue 文件里
    // 例如, 如果你有一条匹配规则 /\.js$/ 的规则, 那么他会应用到 .vue 文件中的 <script> 板块中
    new VueLoaderPlugin(),
    // 把第三方库暴露到 window context 下
    new webpack.ProvidePlugin({
      Vue: "vue",
      axios: "axios",
      _: "lodash",
    }),
    // 定义全局常量
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true, // 支持 vue 解析 optionsAPI
      __VUE_PROD_DEVTOOLS__: false, // 禁用 Vue 调试工具
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false, // 禁用生成环境显示 "水合" 信息
    }),
    // 构造最终渲染的页面模板
    ...htmlWebpackPluginList,
  ],
  // 配置打包输出优化(代码分割, 模块合并, 缓存, TreeShaking, 压缩等优化策略)
  optimization: {
    /**
     * 把 js 文件打包城3中类型
     * 1. vendor: 第三方 lib 库, 基本不会动, 排除依赖版本升级
     * 2. common: 业务组件代码的公共部分抽取出来, 改动较少
     * 3. entry.{page}: 不同页面 entry 里的业务组件代码的差异部分, 会经常改动
     * 目的: 把改动和引用频率不一样的 js 区分出来, 以达到更好利用浏览器缓存的效果
     */
    splitChunks: {
      chunks: "all", // 对同步和异步模块都进行分割
      maxAsyncRequests: 10, // 每次异步加载的最大并行请求数
      maxInitialRequests: 10, // 入口点的最大并行请求数
      cacheGroups: {
        // 第三方依赖库
        vendor: {
          test: /[\\/]node_modules[\\/]/, // 打包 node_modules 中的文件
          name: "vendor", // 模块名称
          priority: 20, // 优先级, 数字越大, 优先级越高
          enforce: false, // 不强制执行
          reuseExistingChunk: true, // 复用已有的公共 chunk
        },
        common: {
          test: /[\\/]common|widgets[\\/]/,
          name: "common", // 模块名称
          minChunks: 2, // 被两处引用即被归为公共模块
          minSize: 1, // 最小分割文件大小 (1 byte)
          priority: 10, // 优先级, 数字越大, 优先级越高
          reuseExistingChunk: true, // 复用已有的公共 chunk
        },
      },
    },
    // 将 webpack 运行时生成的代码打包到 runtime.js
    runtimeChunk: true,
  },
};
