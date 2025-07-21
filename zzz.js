import { readdirSync, readFileSync, writeFileSync } from "fs";

const packages = readdirSync('packages');

for (const pkg of packages) {
  const packageJson = JSON.parse(readFileSync(`packages/${pkg}/package.json`, 'utf8'));
  const devDependencies = packageJson.devDependencies;

  const removeDeps = [
    'eslint',
    'eslint-config-godaddy',
    'eslint-config-godaddy-typescript',
    'eslint-plugin-jest',
    'eslint-plugin-unicorn',
    'typescript',
    'cross-env',
    "@jest/globals",
    "@types/inquirer",
    "@types/jest",
    "@types/node",
  ];

  // for (const dep of removeDeps) {
  //   if (devDependencies[dep]) {
  //     delete devDependencies[dep];
  //   }
  // }

  if (packageJson.eslintConfig) {
    delete packageJson.eslintConfig;
  }

  if (packageJson.eslintIgnore) {
    delete packageJson.eslintIgnore;
  }

  writeFileSync(`packages/${pkg}/package.json`, JSON.stringify(packageJson, null, 2));
}
