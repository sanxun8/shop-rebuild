const Ajv = require("ajv");

/**
 * API 参数合法性验证
 * @param {object} app koa 实例
 */
module.exports = (app) => {
  const ajv = new Ajv();
  const $schema = "http://json-schema.org/draft-07/schema";

  return async (req, res, next) => {
    // 只对 API 请求作验证
    if (req.path.indexOf("/api") < 0) {
      return await next();
    }

    // 获取请求参数
    const { body, query, headers } = req;
    const { params, path, method } = req;

    app.logger.info(`[${method} ${path}] body: ${JSON.stringify(body)}`);
    app.logger.info(`[${method} ${path}] query: ${JSON.stringify(query)}`);
    app.logger.info(`[${method} ${path}] params: ${JSON.stringify(params)}`);
    app.logger.info(`[${method} ${path}] headers: ${JSON.stringify(headers)}`);

    const schema = app.routerSchema[path]?.[method.toLowerCase()];

    if (!schema) {
      return await next();
    }

    let valid = true;

    // ajv 校验器
    let validate;

    // 校验 headers
    if (valid && headers && schema.headers) {
      schema.headers.$schema = $schema;
      validate = ajv.compile(schema.headers);
      valid = validate(headers);
    }
    // 校验 body
    if (valid && body && schema.body) {
      schema.body.$schema = $schema;
      validate = ajv.compile(schema.body);
      valid = validate(body);
    }

    // 校验 query
    if (valid && query && schema.query) {
      schema.query.$schema = $schema;
      validate = ajv.compile(schema.query);
      valid = validate(query);
    }

    // 校验 params
    if (valid && params && schema.params) {
      schema.params.$schema = $schema;
      validate = ajv.compile(schema.params);
      valid = validate(params);
      return;
    }

    if (!valid) {
      res.status = 200;
      res.json({
        success: false,
        message: `request validate fail: ${ajv.errorsText(validate.errors)}`,
        code: 442,
      });
      return;
    }

    return await next();
  };
};
