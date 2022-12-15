const { devDependencies } = require('../package');
const timing = { after: ['@gasket/nextjs'] };

async function handler(gasket, context) {
  const { pkg } = context;

  pkg.add('dependencies', {
    'react': devDependencies.react,
    'react-dom': devDependencies['react-dom']
  }, { force: true });

  pkg.add('devDependencies', {
    '@testing-library/react': devDependencies['@testing-library/react']
  }, { force: true });
}

module.exports = {
  timing,
  handler
};
