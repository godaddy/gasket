const fs = require('fs-extra');
const path = require('path');
const fsUtils = require('./fs-utils');
const { getIntlConfig } = require('./configure');


class BuildModules {
  /**
   * Instantiate a builder to gather locale files
   *
   * @param {Gasket} gasket - Gasket API
   */
  constructor(gasket) {
    const { logger, config: { root } } = gasket;
    const intlConfig = getIntlConfig(gasket);

    const { modules } = intlConfig;
    const { excludes, localesDir } = modules;

    this._logger = logger;
    this._outputDir = path.resolve(path.join(intlConfig.localesDir, 'modules'));
    this._nodeModulesDir = path.resolve(path.join(root, 'node_modules'));
    this._lookupDir = localesDir;
    this._excludes = excludes;
  }

  /**
   * Given a source folder, this function minifies all the files in that folder
   * and sets a unique hash for each file and saves in the target location
   *
   * @param {string} srcDir - Source directory path
   * @param {string} tgtDir - Target directory path
   * @returns {Promise} promise
   */
  async copyFolder(srcDir, tgtDir) {
    const fileNames = await fs.readdir(srcDir);

    const promises = fileNames.map(async fileName => {
      const srcFile = path.join(srcDir, fileName);
      const tgtFile = path.join(tgtDir, fileName);
      if (path.extname(srcFile) === '.json') {
        return await this.copyFile(srcFile, tgtFile);
      }
    });
    return await Promise.all(promises);
  }

  /**
   * Copies the source file to proper target location
   *
   * @param {string} src - full path to source file
   * @param {string} tgt - target folder location
   * @returns {Promise} - resolves once the file is saved
   */
  async copyFile(src, tgt) {
    await fs.mkdirp(path.dirname(tgt));
    const buffer = await fs.readFile(src);
    const output = JSON.parse(buffer);
    return fsUtils.saveJsonFile(tgt, output);
  }

  /**
   * Processes locale files from source to target build directory
   *
   * @param {string} srcDir - Source locale directory
   * @param {string} tgtDir - Target locale directory
   * @param {string[]} fileNames - Names of the locale files
   * @returns {Promise} promise
   */
  processFiles(srcDir, tgtDir, fileNames) {
    const promises = fileNames.map(async fileName => {
      const srcFile = path.join(srcDir, fileName);
      const tgtFile = path.join(tgtDir, fileName);

      if (path.extname(srcFile) === '.json') {
        return await this.copyFile(srcFile, tgtFile);
      } else if ((await fs.lstat(srcFile)).isDirectory()) {
        return await this.copyFolder(srcFile, tgtFile);
      }
    });
    return Promise.all(promises);
  }

  /**
   * Reads the source directory and returns the package name e.g. @gasket/next
   *
   * @param {string} srcDir - Source directory path
   * @returns {string} package name
   */
  getPackageNameFromDir(srcDir) {
    const leafFolder = path.dirname(srcDir);
    const leafFolderName = path.basename(leafFolder);
    const parentFolder = path.dirname(leafFolder);
    const parentFolderName = path.basename(parentFolder);

    let pkgName = leafFolderName;
    if (parentFolderName.startsWith('@')) {
      pkgName = `${parentFolderName}/${leafFolderName}`;
    }
    return pkgName;
  }

  /**
   * Reads the package.json and returns the package name e.g. @gasket/next
   *
   * @param {string} srcDir - Source directory path (a locales directory)
   * @returns {string} package name
   */
  async getPackageName(srcDir) {
    const pkgDir = path.dirname(srcDir);
    try {
      const pkg = await fs.readJson(path.join(pkgDir, 'package.json'));
      return pkg.name || this.getPackageNameFromDir(srcDir);
    } catch (e) {
      return this.getPackageNameFromDir(srcDir);
    }
  }

  /**
   * Processes directories
   *
   * @param {string[]} buildDirs - list of dirs to process
   */
  async processDirs(buildDirs) {
    for (const srcDir of buildDirs) {
      const pkgName = await this.getPackageName(srcDir);
      const tgtDir = path.join(this._outputDir, pkgName);

      this._logger.log(`build:locales: Updating locale files for: ${pkgName}`);

      await fs.remove(tgtDir);
      await fs.mkdirp(tgtDir);

      const fileNames = await fs.readdir(srcDir);
      await this.processFiles(srcDir, tgtDir, fileNames);
    }

    this._logger.log(`build:locales: Completed locale files update.`);
  }

  /**
   * Find modules that have /locales folder to process
   *
   * @returns {string[]} directories - list of paths
   */
  async discoverDirs() {
    const dirs = await fsUtils.getDirectories(this._nodeModulesDir);

    return dirs.reduce(async (prevPromise, dir) => {
      const resArr = await prevPromise;
      if (this._excludes.includes(path.basename(dir))) return resArr;
      const buildDir = path.join(dir, this._lookupDir);
      try {
        const stat = await fs.lstat(buildDir);
        if (stat.isDirectory()) {
          resArr.push(buildDir);
        }
      } catch (e) {
        // ignore
      }
      return resArr;
    }, Promise.resolve([]));
  }

  /**
   * Starts the build process
   */
  async run() {
    await fs.remove(this._outputDir);
    await fs.mkdirp(this._outputDir);
    const srcDirs = await this.discoverDirs();
    await this.processDirs(srcDirs);
  }
}

/**
 * Discovers locale files under node modules with and copies them to output dir.
 *
 * @param {Gasket} gasket - Gasket API
 */
module.exports = async function buildModules(gasket) {
  const builder = new BuildModules(gasket);
  await builder.run();
};

module.exports.BuildModules = BuildModules;
