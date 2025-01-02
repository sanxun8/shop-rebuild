module.exports = (app) => {
  return class ViewController {
    /**
     * 渲染页面
     */
    async renderPage(req, res) {
      await res.render(`dist/${req.params.page}.entry.ejs`, {
        name: app.options?.name,
        env: app.env.get(),
        options: JSON.stringify(app.options),
      });
    }
  };
};
