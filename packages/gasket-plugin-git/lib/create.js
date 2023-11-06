import path from 'path';

/**
 * Create hook adds template files if gitInit
 *
 * @param {Gasket} gasket - Gasket
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
export default async function create(gasket, context) {
  const { gitInit, files } = context;

  if (gitInit) {
    files.add(
      path.join(__dirname, '..', 'generator', '.*')
    );
  }
};
