import path from 'path';
import { writeFile } from 'fs/promises';

export default async function writePkg(context) {
  const { dest, pkg, basePackageFilePath } = context;
  const fileName = 'package.json';
  const filePath = path.join(dest, fileName);
  let newPkg;

  if (basePackageFilePath) {
    const file = (await import(basePackageFilePath, {
      with: { type: 'json' }
    })).default;
    newPkg = context.ConfigBuilder.createPackageJson({
      ...file
    });

    const { dependencies, devDependencies, scripts, ...rest } = pkg.fields;
    newPkg.add('dependencies', pkg.fields.dependencies);
    newPkg.add('devDependencies', pkg.fields.devDependencies);
    newPkg.add('scripts', pkg.fields.scripts);
    newPkg.fields = { ...newPkg.fields, ...rest };
  }

  await writeFile(filePath, JSON.stringify(newPkg || pkg, null, 2), 'utf8');
}
