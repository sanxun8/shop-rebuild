const express = require("express");
const path = require("path");
const { sep } = path; // 兼容不容操作系统的斜杠

const env = require("./env");

const middlewareLoader = require("./loader/middleware");
const routerSchemaLoader = require("./loader/router-schema");
const routerLoader = require("./loader/router");
const controllerLoader = require("./loader/controller");
const serviceLoader = require("./loader/service");
const configLoader = require("./loader/config");
const extendLoader = require("./loader/extend");

module.exports = {
  /**
   * 启动项目
   * @params options 项目配置
   * options = {
   *   name // 项目名称
   *   homePath // 项目首页
   * }
   */
  start(options) {
    // express 实例
    const app = new express();

    // 应用配置
    app.options = options;

    // 基础路径
    app.baseDir = process.cwd();

    // 业务文件路径
    app.businessPath = path.resolve(app.baseDir, `.${sep}app`);

    // 初始化环境配置
    app.env = env();
    console.log(`-- [start] env: ${app.env.get()} --`);

    // 加载 middleware
    middlewareLoader(app);
    console.log(`-- [start] load middleware done --`);

    // 加载 router-schema
    routerSchemaLoader(app);
    console.log(`-- [start] load routerSchema done --`);

    // 加载 controller
    controllerLoader(app);
    console.log(`-- [start] load controller done --`);

    // 加载 service
    serviceLoader(app);
    console.log(`-- [start] load service done --`);

    // 加载 config
    configLoader(app);
    console.log(`-- [start] load config done --`);

    // 加载 extend
    extendLoader(app);
    console.log(`-- [start] load extend done --`);

    // 注册全局中间件
    try {
      require(path.resolve(app.businessPath, `.${sep}middleware.js`))(app);
      console.log(`-- [start] load appMiddleware done --`);
    } catch (e) {
      console.log("[exception] there is no appMiddleware file");
    }

    // 注册路由
    routerLoader(app);
    console.log(`-- [start] load router done --`);

    // 启动服务
    try {
      const port = process.env.PORT || 8080;
      const host = process.env.IP || "0.0.0.0";
      app.listen(port, host);
      console.log(`server running on port ${port}`);
    } catch (e) {
      console.error(e);
    }

    return app;
  },
};
