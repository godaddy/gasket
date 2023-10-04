module.exports = app => {
  app.use('/some/route', (req, res, next) => {
    next(new Error('Not implemented'));
  });
};
