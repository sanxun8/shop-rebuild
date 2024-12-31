const glob = require("glob");
const path = require("path");
const { sep } = path;

/**
 * service loader
 * @param {object} app Koa 实例
 *
 * 加载所有 service, 可通过 `app.service.${目录}.${文件}` 访问
 *
 * 例子:
 * |- app/service
 * |  |- custom-module
 * |  |  |- custom-service
 *
 * => app.service.customModle.customService
 *
 */
module.exports = (app) => {
  // 读取 app/service/**/** */.js 下所有文件
  const servicePath = path.resolve(app.businessPath, `.${sep}service`);
  const fileList = glob.sync(
    path.resolve(servicePath, `.${sep}**${sep}**.js`).replace(/\\/g, "/")
  );

  // 遍历所有文件目录, 把内容加载到 app.service 下
  const service = {};
  fileList.forEach((file) => {
    // 提取文件名称
    let name = path.resolve(file);
    // 截取路径 app/service/custom-modle/custom-service.js => custom-modle/custom-service
    name = name.substring(
      name.lastIndexOf(`service${sep}`) + `service${sep}`.length,
      name.lastIndexOf(".")
    );
    // 把 '-' 统一改为驼峰式 custom-modle/custom-service => customModle/customService
    name.replace(/[_-][a-z]/gi, (s) => s.substring(1).toUpperCase());
    // 挂载 service 到内存 app 对象中
    let tempService = service;
    const names = name.split(sep);
    for (let i = 0, len = names.length; i < len; ++i) {
      if (i === len - 1) {
        const ServerModule = require(path.resolve(file))(app);
        tempService[names[i]] = new ServerModule();
      } else {
        if (!tempService[names[i]]) {
          tempService[names[i]] = {};
        }
        tempService = tempService[names[i]];
      }
    }
  });
  app.service = service;
};
