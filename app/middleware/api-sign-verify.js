const md5 = require("md5");

/**
 * API 签名合法性验证
 * @param {object} app koa 实例
 */
module.exports = (app) => {
  return async (req, res, next) => {
    // 只对 API 请求作验证
    if (req.path.indexOf("/api") < 0) {
      return await next();
    }

    const { path, method } = req;
    const { headers } = req;
    const { s_sign: sSign, s_t: st } = headers;
    const signKey = "0302d750-40ef-43ae-84dd-69cc97385040";
    const signnature = md5(`${signKey}_${st}`);
    app.logger.info(`[${method} ${path}] signnature: ${signnature}`);

    if (
      !sSign ||
      !st ||
      signnature !== sSign.toLowerCase() ||
      Date.now() - st > 600 * 1000
    ) {
      res.status = 200;
      res.json({
        success: false,
        message: "signature not correct!!",
        code: 445,
      });
      return;
    }

    return await next();
  };
};
