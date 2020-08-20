#!/usr/bin/env node

const { fork } = require('child_process');
const path = require('path');

const [,, ...args] = process.argv;

function main() {
  return fork(path.join(__dirname, 'node_modules', '.bin', 'gasket'), ['create', ...args], { stdio: 'inherit', stdin: 'inherit', stderr: 'inherit' });
}
main();
