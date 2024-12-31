module.exports = (app) => {
  return class UserController {
    getUser(req, res, next) {
      const { user: userService } = app.service;

      res.success(userService.getUser());
    }
  };
};
