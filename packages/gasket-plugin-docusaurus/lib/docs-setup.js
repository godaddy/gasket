module.exports = function docsSetup() {
  return {
    transforms: [{
      global: true,
      test: /\.md$/,
      handler: content => {
        content = content
          .replace(/.\/LICENSE.md/g, '/LICENSE')
          .replace(/\/README.md/g, '')
          .replace(/(\.\.\/)+/g, '/');

        const challenge = content.match(/(?:\/docs\/)([A-Z|a-z]*)(?:\.md)/);
        if (challenge) {
          const [match, filename] = challenge;
          content = content.replace(new RegExp(match, 'g'), `./${filename}`);
        }

        return content;
      }
    }]
  };
};
