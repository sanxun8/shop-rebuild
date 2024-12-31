const ExpressRouter = require("express").Router;
const glob = require("glob");
const path = require("path");
const { sep } = path;

/**
 * router loader
 * @param {object} app express 实例
 *
 * 解析所有 app/router/ 下所有 js 文件, 加载到 ExpressRouter 下
 *
 */
module.exports = (app) => {
  // 找到路由文件路径
  const routerPath = path.resolve(app.businessPath, `.${sep}router`);

  // 实例化 ExpressRouter
  const router = ExpressRouter();

  // 注册所有路由
  const fileList = glob.sync(
    path.resolve(routerPath, `.${sep}**${sep}**.js`).replace(/\\/g, "/")
  );
  fileList.forEach((file) => {
    require(path.resolve(file))(app, router);
  });

  // 路由兜底(健壮性)
  router.get("*", async (ctx, next) => {
    ctx.status = 302; // 临时重定向
    ctx.redirect(app?.options?.homePage ?? "/");
  });

  // 路由注册到 app 上
  app.use(router);
};
