/// <reference types="create-gasket-app" />

/**
 * Creates a function that retrieves the development dependencies for a specified package.
 *
 * This function ensures that only valid package names are processed and throws an error
 * if the package name is invalid or missing from the predefined dependencies list.
 * @type {import('./internal').makeGatherDevDeps}
 */
function makeGatherDevDeps() {
  var eslintVersion = '^8.57.1';
  var babelCore = { '@babel/core': '>=7' };
  var eslintBaseDeps = { eslint: eslintVersion };
  var eslintImport = { 'eslint-plugin-import': '^2.27.5' };

  var dependencies = {
    'eslint-config-godaddy': { ...eslintBaseDeps, 'eslint-config-godaddy': '^7.1.1' },
    'eslint-config-godaddy-react': { ...eslintBaseDeps, 'eslint-config-godaddy-react': '^9.1.0', ...babelCore },
    'eslint-config-godaddy-flow': { ...eslintBaseDeps, 'eslint-config-godaddy-flow': '^6.0.2', ...babelCore },
    'eslint-config-godaddy-react-flow': { ...eslintBaseDeps, 'eslint-config-godaddy-react-flow': '^6.0.2', ...babelCore },
    '@godaddy/eslint-plugin-react-intl': { ...eslintBaseDeps, '@godaddy/eslint-plugin-react-intl': '^1.3.0' },
    'stylelint-config-godaddy': { 'stylelint-config-godaddy': '^0.6.0', 'stylelint': '^15' },
    'standard': {
      standard: '^17.1.2'
    },
    'snazzy': {
      snazzy: '9.0.0'
    },
    'eslint-config-airbnb': {
      ...eslintBaseDeps,
      'eslint-config-airbnb': '^19.0.4',
      ...eslintImport,
      'eslint-plugin-jsx-a11y': '^6.6.1',
      'eslint-plugin-react': '^7.32.2',
      'eslint-plugin-react-hooks': '^4.6.0'
    },
    'eslint-config-airbnb-base': { ...eslintBaseDeps, 'eslint-config-airbnb-base': '^15.0.0', ...eslintImport },
    'eslint-config-next': { ...eslintBaseDeps, 'eslint-config-next': '^13.2.1', 'typescript': '^5.2.2' },
    'stylelint-config-airbnb': {
      'stylelint-config-airbnb': '^0.0.0',
      'stylelint': '^8.0.0',
      'stylelint-order': '^0.7.0',
      'stylelint-scss': '^1.2.1'
    }
  };

  /**
   * Retrieves the dependencies for a given package name.
   * @type {import('./internal').gatherDevDeps}
   */
  function gatherDevDeps(name) {
    if (typeof name !== 'string' || !name.trim()) {
      console.error(`Invalid package name: ${JSON.stringify(name)}`);
      throw new TypeError('Package name must be a non-empty string.');
    }

    if (!(name in dependencies)) {
      console.error(`Package not found: ${name}`);
      throw new ReferenceError(`No dependency information found for package: ${name}`);
    }

    return dependencies[name];
  }

  return gatherDevDeps;
}

/**
 * Creates a function to generate the correct package script execution command.
 *
 * This function returns a script command formatted for npm, yarn, or pnpm, depending
 * on the package manager used in the given context.
 * @type {import('./internal').makeRunScriptStr}
 */
function makeRunScriptStr(context) {
  let runCmd = `${context.packageManager} run`;

  /**
   * Formats the script command for execution.
   * @type {import('./internal').runScriptStr}
   */
  function runScriptStr(script) {
    if (typeof script !== 'string' || !script.trim()) {
      console.error(`Invalid script name: ${JSON.stringify(script)}`);
      throw new TypeError('Script name must be a non-empty string.');
    }

    return runCmd.startsWith('npm') ? `${runCmd} ${script}` : (`${runCmd} ${script}`).replace(' -- ', ' ');
  }

  return runScriptStr;
}

/**
 * Creates a function to safely execute package scripts, ensuring errors do not
 * cause a complete failure during project setup.
 *
 * This function checks whether a script exists in the `package.json` scripts section
 * before attempting to run it. Errors are logged and stored in the warnings array
 * instead of halting execution.
 * @type {import('./internal').makeSafeRunScript}
 */
function makeSafeRunScript(context, runScript) {
  /**
   * Runs a script safely without stopping execution on errors.
   * @type {import('./internal').safeRunScript}
   */
  async function safeRunScript(name) {
    if (typeof name !== 'string' || !name.trim()) {
      console.error(`Invalid script name: ${JSON.stringify(name)}`);
      throw new TypeError('Script name must be a non-empty string.');
    }

    if (!context.pkg.has('scripts', name)) {
      console.warn(`Script '${name}' not found in package.json.`);

      return;
    }

    try {
      await runScript(name);
    } catch (error) {
      console.error(`Error running script '${name}':`, error);
      context.warnings.push(`Errors encountered running script: '${name}'`);
    }
  }

  return safeRunScript;
}

module.exports = {
  makeGatherDevDeps,
  makeRunScriptStr,
  makeSafeRunScript
};
