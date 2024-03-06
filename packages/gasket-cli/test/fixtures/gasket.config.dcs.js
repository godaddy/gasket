module.exports = {
  someService: {
    extraSecure: false
  },
  other: 'setting',
  environments: {
    'dev': {
      someService: { url: 'https://some-dev.url/' }
    },
    'test': {
      someService: { url: 'https://some-test.url/' }
    },
    'prod': {
      someService: { extraSecure: true }
    },
    'prod.dc1': {
      someService: { url: 'http://some-prod.dc1.url/' }
    },
    'prod.dc2': {
      someService: { url: 'http://some-prod.dc2.url/' }
    }
  }
};
