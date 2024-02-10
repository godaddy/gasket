const fs = require('fs-extra');
const path = require('path');
const fsUtils = require('./fs-utils');
const { getIntlConfig } = require('./configure');

const debug = require('debug')('gasket:plugin:intl:buildModules');

const rePkgParts = /^(?<name>(?:@[\w-]+\/)?[\w-]+)(?<dir>\/[\w-]+)?$/;

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

    if (Array.isArray(modules)) {
      this._lookupModuleDirs = modules;
    }

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
    debug(`Copying folder from ${srcDir} to ${tgtDir}`);

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
    debug(`Copying file from ${src} to ${tgt}`);

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
    debug(`Processing files in ${srcDir} to target ${tgtDir}`);

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
   * @param {SrcPkgDir[]} srcPkgDirs - list of dirs to process
   */
  async processDirs(srcPkgDirs) {
    for (const srcPkgDir of srcPkgDirs) {
      const [pkgName, srcDir] = srcPkgDir;
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
   * @returns {SrcPkgDir[]} source package directories
   */
  async discoverDirs() {
    const pkgDirs = await fsUtils.getPackageDirs(this._nodeModulesDir);

    return pkgDirs.reduce(async (prevPromise, pkgDir) => {
      const [pkgName, dir] = pkgDir;
      const resArr = await prevPromise;

      if (this._excludes.includes(path.basename(dir))) return resArr;
      const buildDir = path.resolve(path.join(dir, ...this._lookupDir.split('/')));
      try {
        const stat = await fs.lstat(buildDir);
        if (stat.isDirectory()) {
          resArr.push([pkgName, buildDir]);
        }
      } catch (e) {
        // ignore
      }
      return resArr;
    }, Promise.resolve([]));
  }

  /**
   * Find modules with locale directories to process
   *
   * @returns {SrcPkgDir[]} source package directories
   */
  async gatherModuleDirs() {
    if (this._lookupModuleDirs) {
      const promises = this._lookupModuleDirs.map(async lookupDir => {
        let results;

        const match = lookupDir.match(rePkgParts);
        if (!match?.groups?.name) {
          this._logger.warning(`build:locales: malformed module name: ${lookupDir}`);
          return;
        }

        const pkgName = match.groups.name;
        const subDir = (match.groups.dir ?? '/locales').substring(1);

        const buildDir = path.join(
          this._nodeModulesDir,
          ...pkgName.split('/'),
          ...subDir.split('/')
        );

        try {
          const stat = await fs.lstat(buildDir);
          if (stat.isDirectory()) {
            results = [pkgName, buildDir];
          }
        } catch (e) {
          // skip
        }

        if (!results) {
          this._logger.warning(`build:locales: locales directory not found for: ${lookupDir}`);
        }
        return results;
      });

      const results = await Promise.all(promises);
      return results.filter(Boolean);
    }

    return this.discoverDirs();
  }

  /**
   * Starts the build process
   */
  async run() {
    await fs.remove(this._outputDir);
    await fs.mkdirp(this._outputDir);
    const srcPkgDirs = await this.gatherModuleDirs();
    await this.processDirs(srcPkgDirs);
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
