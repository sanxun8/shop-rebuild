const glob = require("glob");
const path = require("path");
const { sep } = path;

/**
 * extend loader
 * @param {object} app Koa 实例
 *
 * 加载所有 extend, 可通过 `app.extend.${文件}` 访问
 *
 * 例子:
 * |- app/extend
 * |  |- custom-extend
 *
 * => app.extend.customExtend
 *
 */
module.exports = (app) => {
  // 读取 app/extend/**.js 下所有文件
  const extendPath = path.resolve(app.businessPath, `.${sep}extend`);
  const fileList = glob.sync(
    path.resolve(extendPath, `.${sep}**.js`).replace(/\\/g, "/")
  );

  // 遍历所有文件目录, 把内容加载到 app.extend 下
  const extend = {};
  fileList.forEach((file) => {
    // 提取文件名称
    let name = path.resolve(file);

    // 截取路径 app/extend/custom-modle/custom-extend.js => custom-modle/custom-extend
    name = name.substring(
      name.lastIndexOf(`extend${sep}`) + `extend${sep}`.length,
      name.lastIndexOf(".")
    );

    // 把 '-' 统一改为驼峰式 custom-modle/custom-extend => customModle/customExtend
    name.replace(/[_-][a-z]/gi, (s) => s.substring(1).toUpperCase());

    // 过滤 app 已经存在的 Key
    for (const key in app) {
      if (key === name) {
        console.log(`[extend load error] name:${name} is already in app`);
        return;
      }
    }

    // 挂载 extend 到 app 上
    app[name] = require(path.resolve(file))(app);
  });
  app.extend = extend;
};
