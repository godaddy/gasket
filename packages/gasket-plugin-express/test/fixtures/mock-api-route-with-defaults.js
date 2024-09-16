function routes(app) {
  app.use('/some/route', (req, res, next) => {
    next(new Error('Not implemented'));
  });
}

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = routes;
