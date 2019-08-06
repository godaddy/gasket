const mockLoggerMiddleware = () => next => action => next(action);

module.exports = {
  createLogger: function createLogger() {
    return mockLoggerMiddleware;
  },
  mockLoggerMiddleware
};
