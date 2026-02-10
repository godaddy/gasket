import rootConfig from '../../eslint.config.ts';

export default [
  ...rootConfig,
  {
    ignores: ['lib/**', 'cjs/**']
  }
];
