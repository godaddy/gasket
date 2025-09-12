/* eslint-disable vitest/expect-expect, jest/expect-expect */
import type { Gasket, Hook } from '@gasket/core';
import { CreateContext } from 'create-gasket-app';

describe('create-gasket-app', () => {
  it('defines the create lifecycle', () => {
    const hook: Hook<'create'> = (gasket: Gasket, context: CreateContext): void => { };
    const asyncHook: Hook<'create'> = async (gasket: Gasket, context: CreateContext): Promise<void> => { };
  });

  it('describes the create context helpers', () => {
    const hook: Hook<'create'> = async (gasket: Gasket, context: CreateContext) => {
      const { pkg, files, readme, gasketConfig, pkgManager } = context;

      pkg.add('devDependencies', { 'left-pad': '^1.0.0' });
      pkg.add('devDependencies', { 'left-pad': '^1.0.0' }, { force: true });

      files.add('generator/**/*');
      files.add(
        'generator/*',
        'generator/**/*'
      );

      readme
        .heading('Hello, World')
        .heading('Hello, World', 1)
        .subHeading('Subheading')
        .content('Hello, World')
        .list(['one', 'two', 'three'])
        .link('https://example.com', 'Example')
        .codeBlock('console.log("Hello, World")')
        .codeBlock('console.log("Hello, World")', 'javascript');
      await readme.markdownFile('README.md');

      gasketConfig.addPlugin('pluginAny', '@my/gasket-plugin');
      gasketConfig.addImport('{ readFile }', 'fs/promises');
      gasketConfig.addExpression('const file = fs.readFileSync(\'./file.txt\')');
      gasketConfig.injectValue('foo.bar', 'baz');

      await pkgManager.exec('echo', ['hello', 'world']);
    };
  });

  it('defines the prompt hook', () => {
    const hook: Hook<'prompt'> = async (gasket: Gasket, context: CreateContext, utils: unknown) => {
      return context;
    };
  });

  it('defines the postCreate hook', () => {
    const hook: Hook<'postCreate'> = async (gasket, context, utils) => {
      await utils.runScript('echo "hello, world"');
    };
  });

  it('validates the return from configure hooks', () => {
    // @ts-expect-error
    const hook: Hook<'create'> = async (gasket, config) => 'huh?';
  });
});
