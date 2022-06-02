module.exports = function docsSetup() {
  return {
    transforms: [{
      global: true,
      test: /\.md$/,
      handler: content => {
        let mark = content
          .replace(/.\/LICENSE.md/g, '/LICENSE')
          .replace(/\/README.md/g, '')
          .replace(/(\.\.\/)+/g, '/');

        const challenge = content.match(/(?:\/docs\/)([A-Z|a-z]*)(?:\.md)/);
        if (challenge) {
          const [match, filename] = challenge;
          return mark.replace(new RegExp(match, 'g'), `./${filename}`);
        }

        return mark;
      }
    }]
  };
};
