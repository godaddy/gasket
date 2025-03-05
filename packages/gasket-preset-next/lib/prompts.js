import inquirer from 'inquirer';

const prompts = [
  {
    name: 'appDescription',
    message: 'What is your app description?',
    type: 'input',
    default: 'A basic gasket app'
  },
  {
    name: 'typescript',
    message: 'Do you want to use TypeScript?',
    type: 'confirm',
    default: true
  },
  {
    name: 'nextServerType',
    message: 'Which server type would you like to use?',
    type: 'list',
    choices: [
      // { name: 'Page Router w/ Custom Server', value: 'customServer' },
      // { name: 'Page Router', value: 'pageRouter' },
      { name: 'App Router', value: 'appRouter' }
    ]
  },
  {
    name: 'nextDevProxy',
    message: 'Do you want an HTTPS proxy for the Next.js server?',
    type: 'confirm',
    default: true
  },
  // {
  //   name: 'addSitemap',
  //   message: 'Do you want to add a sitemap?',
  //   type: 'confirm',
  //   default: false
  // },
  {
    name: 'useDocs',
    message: 'Do you want to use generated documentation?',
    type: 'confirm'
  },
  {
    name: 'useDocusaurus',
    message: 'Do you want to use Docusaurus for documentation?',
    type: 'confirm',
    when: answers => answers.useDocs
  }
];

export default async function runPrompts(context) {
  const prompt = inquirer.createPromptModule();
  const answers = await prompt(prompts);
  Object.assign(context, answers);
}
