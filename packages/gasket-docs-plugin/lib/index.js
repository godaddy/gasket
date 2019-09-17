module.exports = {
  name: 'docs',
  hooks: {
    configure: require('./configure'),
    getCommands: require('./get-commands'),
    metadata: require('./metadata'),
    docs: require('./docs'),
    docsView: require('./docs-view')
  }
};
