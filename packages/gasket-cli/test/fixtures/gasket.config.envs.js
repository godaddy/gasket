module.exports = {
  someService: {
    requestRate: 9000,
    url: 'https://some.url/'
  },
  other: 'setting',
  environments: {
    local: {
      someService: { url: 'https://local.some-dev.url/' }
    },
    dev: {
      someService: { url: 'https://some-dev.url/' },
      anotherService: { url: 'https://another-dev.url/' }
    },
    test: {
      someService: { url: 'https://some-test.url/' },
      anotherService: { url: 'https://another-test.url/' }
    }
  }
};
