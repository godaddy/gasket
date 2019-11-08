module.exports = {
  someService: {
    url: 'https://some-test.url/'
  },
  environments: {
    dev: {
      someService: {
        requestRate: 9000
      }
    }
  }
};
