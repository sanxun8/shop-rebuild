module.exports = function (app, router) {
  const { user: userController } = app.controller;

  router.get("/api/user/:id", userController.getUser);
};
