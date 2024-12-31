const glob = require("glob");
const path = require("path");
const { sep } = path;

/**
 * middleware loader
 * @param {object} app Koa 实例
 *
 * 加载所有 middleware, 可通过 `app.middlewares.${目录}.${文件}` 访问
 *
 * 例子:
 * |- app/middleware
 * |  |- custom-module
 * |  |  |- custom-middleware
 *
 * => app.midlewares.customModle.customMiddleware
 *
 */
module.exports = (app) => {
  // 读取 app/middleware/**/** */.js 下所有文件
  const middlewarePath = path.resolve(app.businessPath, `.${sep}middleware`);
  const fileList = glob.sync(
    path.resolve(middlewarePath, `.${sep}**${sep}**.js`).replace(/\\/g, "/")
  );

  // 遍历所有文件目录, 把内容加载到 app.middleware 下
  const middlewares = {};
  fileList.forEach((file) => {
    // 提取文件名称
    let name = path.resolve(file);
    // 截取路径 app/midlewares/custom-modle/custom-middleware.js => custom-modle/custom-middleware
    name = name.substring(
      name.lastIndexOf(`middleware${sep}`) + `middleware${sep}`.length,
      name.lastIndexOf(".")
    );
    // 把 '-' 统一改为驼峰式 custom-modle/custom-middleware => customModle/customMiddleware
    name = name.replace(/[_-][a-z]/gi, (s) => s.substring(1).toUpperCase());
    // 挂载 middlware 到内存 app 对象中
    let tempMiddleware = middlewares;
    const names = name.split(sep);
    for (let i = 0, len = names.length; i < len; ++i) {
      if (i === len - 1) {
        tempMiddleware[names[i]] = require(path.resolve(file))(app);
      } else {
        if (!tempMiddleware[names[i]]) {
          tempMiddleware[names[i]] = {};
        }
        tempMiddleware = tempMiddleware[names[i]];
      }
    }
  });
  app.middlewares = middlewares;
};
