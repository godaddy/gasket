import { Gitignore } from './gitignore.js';

/**
 * Formats gitignore content
 *
 * @param {Object} content - gitignore content
 * @returns {string} formatted gitignore content
 */
function serialize(content) {
  let desiredContent = '';

  for (const category in content) {
    if (content[category].size) {
      category !== '' ? desiredContent += `# ${category}\n` : null;
      desiredContent += [...content[category]].join('\n');
      desiredContent += '\n\n';
    }
  }

  return desiredContent;
}

/**
 * Instantiates new Gitignore instance, adds get method to content using the serialize function, adds gitignore to context
 *
 * @param {CreateContext} context - Create context
 */
function instantiateGitignore(context) {
  const gitignore = new Gitignore();
  Object.defineProperties(gitignore, {
    content: {
      get() {
        return serialize(this._content);
      }
    }
  });
  context.gitignore = gitignore;
}

/**
 * Prompt for git settings during gasket create
 *
 * @param {Gasket} gasket - Gasket
 * @param {CreateContext} context - Create context
 * @param {Object} utils - Prompt utils
 * @param {Function} utils.prompt - Inquirer prompt
 * @returns {Promise<object>} context
 */
export default async function promptHook(gasket, context, { prompt }) {
  if (!('gitInit' in context)) {
    const { gitInit } = await prompt([
      {
        name: 'gitInit',
        message: 'Do you want a git repo to be initialized?',
        type: 'confirm'
      }]);

    instantiateGitignore(context);
    return { ...context, gitInit };
  }

  if ('gitInit' in context) {
    instantiateGitignore(context);
  }

  return context;
};
