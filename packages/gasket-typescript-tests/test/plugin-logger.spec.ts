import type { Gasket, Hook } from '@gasket/core';
import '@gasket/plugin-logger';

type FakeLogger = {
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  fatal: (...args: any[]) => void;
  trace: (...args: any[]) => void;
  child: (meta: Record<string, any>) => FakeLogger;
};

describe('@gasket/plugin-logger', () => {
  it('defines the createLogger lifecycle', async() => {
    const hook: Hook<'createLogger'> = (gasket: Gasket) => {
      return { } as FakeLogger;
    };
  });
});
