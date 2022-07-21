module.exports = (gasket, labels, { res }) => {
  return {
    ...labels,
    locale: res.locals.gasketData.locale
  };
};
