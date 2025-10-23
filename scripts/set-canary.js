import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

function findPackageJsonFiles(dir) {
  const files = [];

  // Root package.json
  const rootPkg = join(dir, 'package.json');
  if (existsSync(rootPkg)) {
    files.push('package.json');
  }

  // Check packages directory
  const dirs = ['packages', 'scripts', 'tools'];

  dirs.forEach(topDir => {
    const topDirPath = join(dir, topDir);
    if (!existsSync(topDirPath)) return;

    const subdirs = readdirSync(topDirPath);
    subdirs.forEach(subdir => {
      const subdirPath = join(topDirPath, subdir);
      if (!statSync(subdirPath).isDirectory()) return;

      // Check for package.json
      const pkgPath = join(subdirPath, 'package.json');
      if (existsSync(pkgPath)) {
        files.push(join(topDir, subdir, 'package.json'));
      }

      // Check for template/package.json
      const templatePkgPath = join(subdirPath, 'template', 'package.json');
      if (existsSync(templatePkgPath)) {
        files.push(join(topDir, subdir, 'template', 'package.json'));
      }
    });
  });

  return files;
}

const packageJsonFiles = findPackageJsonFiles(process.cwd());

let updatedCount = 0;

packageJsonFiles.forEach(file => {
  const filePath = join(process.cwd(), file);
  const content = readFileSync(filePath, 'utf8');
  const pkg = JSON.parse(content);

  let modified = false;

  const depTypes = ['dependencies', 'devDependencies'];

  depTypes.forEach(depType => {
    if (pkg[depType]) {
      Object.keys(pkg[depType]).forEach(dep => {
        if ((dep.startsWith('@gasket/'))
            && !pkg[depType][dep].startsWith('workspace:')) {
          if (pkg[depType][dep] !== 'canary') {
            pkg[depType][dep] = 'canary';
            modified = true;
          }
        }
      });
    }
  });

  if (modified) {
    writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log(`✓ Updated ${file}`);
    updatedCount++;
  }
});

console.log(`\nDone! Updated ${updatedCount} package.json file(s).`);

