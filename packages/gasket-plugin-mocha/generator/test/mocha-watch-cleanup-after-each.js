import { cleanup } from '@testing-library/react';

export const mochaHooks = {
  afterEach() {
    cleanup();
  }
};
