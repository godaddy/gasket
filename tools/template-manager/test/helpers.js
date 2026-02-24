/* eslint-disable no-undefined */
import { vi } from 'vitest';

export function mockRunner() {
  return {
    runCommand: vi.fn().mockResolvedValue(undefined),
    runCommandCaptureStderr: vi.fn().mockResolvedValue({ code: 0, stderr: '' }),
    runCommandCaptureStdout: vi.fn().mockResolvedValue({ code: 0, stdout: '' })
  };
}

export const baseTemplate = {
  name: 'gasket-template-webapp-app',
  packageDir: '/repo/packages/gasket-template-webapp-app',
  templateDir: '/repo/packages/gasket-template-webapp-app/template',
  hasPackageJson: true,
  hasNodeModules: true,
  hasLockfile: true
};

export const baseConfig = {
  root: '/repo',
  packagesDir: '/repo/packages',
  templateFilter: 'gasket-template-',
  updateDepsFilter: '/^@gasket\\/.*$|^@godaddy\\/.*$/',
  retryWithLegacyPeerDeps: true,
  npmCiArgs: ['ci', '--prefer-offline'],
  cleanDirs: ['dist', 'build', '.next', 'node_modules'],
  lintEnv: { ESLINT_USE_FLAT_CONFIG: 'false' },
  testEnv: { ESLINT_USE_FLAT_CONFIG: 'false' },
  validateDotfiles: {
    expectedDotFiles: ['.npmrc', '.gitignore'],
    allowedUnpackedDotFiles: ['.gitignore', '.npmrc']
  }
};
