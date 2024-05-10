import { jest } from '@jest/globals';

// eslint-disable-next-line no-console
const consoleError = console.error;

/**
 * Silence noisy act warnings from console.error
 * TODO: Remove when fix is determined
 *
 * @returns {MockInstance<Console, any>} mock console.error
 */
export function mockConsoleError() {
  return jest.spyOn(console, 'error').mockImplementation((msg) => {
    if (msg.includes('ReactDOMTestUtils.act')) return;
    consoleError(msg);
  });
}

