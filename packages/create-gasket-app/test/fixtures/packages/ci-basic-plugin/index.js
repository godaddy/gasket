module.exports = {
  name: 'ci-basic',
  hooks: {
    async prompt(gasket, context, { prompt }) {
      if (!('awesome' in context)) {
        const { awesome } = await prompt([{
          name: 'awesome',
          message: 'Is this awesome?',
          type: 'confirm'
        }]);

        return { ...context, awesome };
      }
    },
    async create(gasket, context) {
      const { awesome, files, pkg, gasketConfig } = context;
      const path = require('path');

      files.add(
        path.join(__dirname, 'generator', '*'),
        path.join(__dirname, 'generator', '.*'),
        path.join(__dirname, 'generator', '**', '*')
      );

      pkg.add('license', 'UNLICENSED');

      pkg.add('dependencies', {
        'left-pad': '^1.0.0'
      });

      pkg.add('devDependencies', {
        'right-pad': '^1.0.0'
      });

      pkg.add('scripts', {
        ping: 'echo pong'
      });

      gasketConfig.add('basic', {
        awesome
      });
    },
    async postCreate(gasket, context, { runScript }) {
      console.log('basic postCreate');
      const result = await runScript('ping');
      console.log(result.stdout);
    },
    async init(gasket) {
      const { command } = gasket;
      console.log('basic init', `command=${command}`);
    },
    async configure(gasket, config) {
      const { command } = gasket;
      const { env } = config;
      console.log('basic configure', `command=${command}`, `env=${env}`);
      return {};
    },
    async start(gasket) {
      const { command, config } = gasket;
      const { env } = config;
      console.log('basic start', `command=${command}`, `env=${env}`);
    },
    async build(gasket) {
      const { command } = gasket;
      console.log('basic build', `command=${command}`);
    }
  }
};
