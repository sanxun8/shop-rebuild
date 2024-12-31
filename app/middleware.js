const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const { sep } = path;

module.exports = (app) => {
  // 配置静态跟目录
  app.use(express.static(path.resolve(process.cwd(), "./app/public")));

  // 模板渲染引擎
  app.set("views", path.resolve(process.cwd(), `.${sep}app${sep}public`));
  app.set("view engine", "ejs");

  // 引入 req.body 解析中间件
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // 引入 cookie 解析中间件
  app.use(cookieParser());

  // 引入异常捕获中间件
  app.use(app.middlewares.errorHandle);

  // 引入API 签名合法性验证
  app.use(app.middlewares.apiSignVerify);

  // 引入API 参数验证
  app.use(app.middlewares.apiParamsVerify);
};
