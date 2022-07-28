module.exports = (_gasket, transaction, { res }) => {
  transaction.setLabel('locale', res.locals.gasketData.locale);
};
