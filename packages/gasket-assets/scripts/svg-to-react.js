/* eslint-disable no-console */

import svgr from '@svgr/core';
import { transform } from '@babel/core';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import recursive from 'recursive-readdir';
import mkdirp from 'mkdirp';

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'svgs');
const outputDir = path.join(rootDir, 'react');
const banner = '// Generated by @gasket/assets\n';

const babelOptions = {
  presets: [
    require.resolve('@babel/preset-env'),
    require.resolve('@babel/preset-react')
  ],
  plugins: [
    require.resolve('babel-plugin-add-module-exports')
  ]
};

/**
 * Reads and converts an svg file to react component and transform with babel.
 *
 * @param {string} file - Path of file to process
 * @returns {Promise} promise
 */
async function process(file) {
  const outFile = file.replace(srcDir, outputDir).replace('.svg', '.js');

  try {
    const data = await readFile(file);

    //
    // Convert to React
    //
    const component = await svgr(data);

    //
    // Transform to React components
    //
    const results = transform(component, babelOptions);

    //
    // Output the results to file
    //
    await mkdirp(path.dirname(outFile));
    await writeFile(outFile, banner + results.code, 'utf8');
    console.log('wrote', path.relative(rootDir, outFile));
    return Promise.resolve();
  } catch (e) {
    console.error(`Error for ${file}.`, e);
    return Promise.reject(e);
  }
}

/**
 * Find all the *.svg files in the ./svgs dir, and convert them to browser
 * compatible React components into the ./react dir.
 *
 * @returns {Promise} promise
 */
async function main() {
  const promises = [];
  let successCount = 0;
  let errorCount = 0;

  const filterSvg = (f, stats) => !stats.isDirectory() && path.extname(f) !== '.svg';
  const files = await recursive(srcDir, [filterSvg]);

  files.forEach(file => {
    promises.push(process(file)
      .then(() => successCount++, () => errorCount++)
    );
  });

  await Promise.all(promises);

  console.log('-------');
  console.log(`Processed ${successCount}/${files.length} files.`);
  if (errorCount) console.error(`Errors ${errorCount}.`);
}

main();
