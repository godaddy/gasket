const timing = { after: ['@gasket/nextjs'] };

async function handler(gasket, context) {
  const { pkg } = context;
  const hasTestLibReact = pkg.has('devDependencies', '@testing-library/react');

  pkg.add('dependencies', {
    'react': devDependencies.react,
    'react-dom': devDependencies['react-dom']
  }, { force: true });

  if (hasTestLibReact) {
    pkg.add('devDependencies', {
      '@testing-library/react': '^12.0.0'
    }, { force: true });
  }
}

module.exports = {
  timing,
  handler
};
