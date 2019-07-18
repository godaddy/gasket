module.exports = {
  name: 'ci-extra',
  hooks: {
    async prompt(gasket, context) {
      console.log('extra prompt');
      return context;
    }
  }
};
