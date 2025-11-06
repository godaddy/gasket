import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const templatePath = join(__dirname, '../template');

describe('@gasket/template-vite', () => {
  it('has required files', () => {
    expect(existsSync(join(templatePath, 'package.json'))).toBe(true);
    expect(existsSync(join(templatePath, 'gasket.ts'))).toBe(true);
    expect(existsSync(join(templatePath, 'server.ts'))).toBe(true);
    expect(existsSync(join(templatePath, 'vite.config.ts'))).toBe(true);
    expect(existsSync(join(templatePath, 'index.html'))).toBe(true);
    expect(existsSync(join(templatePath, 'src/App.tsx'))).toBe(true);
    expect(existsSync(join(templatePath, 'src/main.tsx'))).toBe(true);
  });

  it('has valid package.json', () => {
    const pkgPath = join(templatePath, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    
    expect(pkg.name).toBe('{{{appName}}}');
    expect(pkg.type).toBe('module');
    expect(pkg.dependencies).toBeDefined();
    expect(pkg.dependencies['@gasket/plugin-vite']).toBeDefined();
    expect(pkg.dependencies.react).toBeDefined();
    expect(pkg.dependencies.vite).toBeDefined();
  });
});

