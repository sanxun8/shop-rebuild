/**
 * 添加响应方法
 */
module.exports = (app) => {
  return (req, res, next) => {
    res.success = (data = {}, metadata = {}) => {
      res.json({
        success: true,
        data,
        metadata,
      });
    };
    res.fail = (message, code) => {
      res.json({
        success: false,
        message,
        code,
      });
    };

    next();
  };
};
