// Mock for @docusaurus/core in test environment
export function start() {
  throw new Error('Docusaurus is not available in test environment');
}

