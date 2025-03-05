import fs from 'fs/promises';
import path from 'path';

function alphabetizeKeys(obj) {
  const ordered = {};
  Object.keys(obj).sort().forEach(key => {
    ordered[key] = obj[key];
  });
  return ordered;
}

async function traversePackages(dir, plugins = []) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const path = `${dir}/${file}`;
    const stat = await fs.lstat(path);
    if (stat.isDirectory()) {
      if (file.startsWith('gasket-plugin-')) {
        plugins.push(file);
      } else {
        await traversePackages(path, plugins);
      }
    }
  }
  return plugins;
}

async function getDependencies() {
  const plugins = await traversePackages('packages');
  const map = {}

  for (const plugin of plugins) {
    const pkg = await fs.readFile(`packages/${plugin}/package.json`, 'utf8');
    const { name, version, dependencies = {}, devDependencies = {} } = JSON.parse(pkg);
    Object.assign(map, dependencies, devDependencies, { [name]: `^${version}` });
  }

  const data = alphabetizeKeys(map);
  await fs.writeFile(path.join(import.meta.dirname, '..', 'generator', 'dependencies.json'), JSON.stringify(data, null, 2));
}

getDependencies();


