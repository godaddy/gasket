const isRelative = /\[.*\]:\.\.\/.*\.md/g;
const str = `
[npm]:https://docs.npm.red
[yarn]:https://yarnpkg.com
[npm env vars]:https://docs.npmjs.com/misc/config#environment-variables
[yarn env vars]:https://yarnpkg.com/en/docs/envvars#toc-npm-config
[inquirer questions]:https://github.com/SBoudrias/Inquirer.js#question
[execWaterfall]:../engine/README.md#execwaterfallevent-value-args
[exec]:../engine/README.md#execevent-args
[Configuration Guide]: docs/configuration.md
[Plugins Guide]: docs/plugins.md
[Presets Guide]: docs/presets.md
[Jest plugin]:../../../plugins/plugin-jest/README.md
[Mocha plugin]:../../../plugins/plugin-mocha/README.md
[lint plugin]:../../../plugins/plugin-lint/README.md
`;

const match = str.match(isRelative);
const t = match.map((link) => {
  return link.split('..').map(el => {
    if (el === '/') {
      return ''
    }
    return el;
  }).filter(el => el !== '').join('docs')
});

console.log(t);
