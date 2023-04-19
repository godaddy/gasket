module.exports = {
  mockConfig: true,

  example: 'base',
  environments: {
    'other-env': {
      example: 'overridden from env'
    }
  },
  commands: {
    'other-cmd': {
      example: 'overridden from cmd'
    }
  }
};
