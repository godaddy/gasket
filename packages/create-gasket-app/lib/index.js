#!/usr/bin/env node

const { fork } = require('child_process');
const path = require('path');

const [, , ...args] = process.argv;

/**
 * Main function to create a Gasket application.
 * @returns {import('child_process').ChildProcess} - The child process spawned
 * to create the Gasket application.
 */
function main() {
  return fork(
    // Path to gasket executable
    path.join(__dirname, '..', 'node_modules', '.bin', 'gasket'),
    // Command and arguments for creating Gasket application
    ['create', ...args],
    // Options for child process
    { stdio: 'inherit' }
  );
}

main();
