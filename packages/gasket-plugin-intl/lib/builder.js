const fs = require('fs-extra');
const path = require('path');
const loaderUtils = require('loader-utils');
const fsUtils = require('./fsUtils');


class Builder {
  /**
   * Instantiate a builder to gather locale files
   *
   * @param {Object} logger - logger instance
   * @param {Object} config - config options
   * @param {Object} config.localeDir - name of directory to discover locale files in
   * @param {Object} config.outputDir - path to output files to
   * @param {Object} config.blacklistModules - Names of modules to exclude
   */
  constructor(logger, config) {
    const { outputDir } = config;

    this._logger = logger;
    this._config = config;
    this._rootDir = process.cwd();
    this._outputDir = path.resolve(outputDir);
    this._nodeModulesDir = path.resolve('./node_modules');
    this._mapFile = path.join(this._outputDir, 'locales-manifest.json');
    this.builderMap = {};
  }

  /**
   * Update the hash in the locale mappings for a folder copy
   *
   * @param {string} tgt - target folder for the locale file
   * @param {string} fileName - target file name e.g. 8sj901s.en-US.json
   */
  updateFolderHash(tgt, fileName) {
    const pkgName = this.getPackageNameFromDir(tgt);
    const nameSpace = path.basename(tgt);
    const [hash, language, ext] = fileName.split('.');
    if (ext) {
      this.builderMap[pkgName] = this.builderMap[pkgName] || {};
      this.builderMap[pkgName][nameSpace] = this.builderMap[pkgName][nameSpace] || {};
      this.builderMap[pkgName][nameSpace][language] = hash;
    }
  }

  /**
   * The filename in this case is expected to be like about.json or some.weird.namespace.json. This function removes
   * the extension and returns the remaining portion as the namespace
   * @param {string} fileName - json file name
   * @returns {string} fileName without extension
   */
  getNamespace(fileName) {
    return path.basename(fileName, '.json');
  }

  /**
   * Given a source folder, this function minifies all the files in that folder
   * and sets a unique hash for each file and saves in the target location
   *
   * @param {string} src - Source directory path
   * @param {string} tgt - Target directory path
   * @returns {Promise} promise
   */
  async moveFolder(src, tgt) {
    const parentFolder = path.dirname(tgt);
    const language = path.basename(tgt);
    const fileNames = await fs.readdir(src);

    const promises = fileNames.map(async fileName => {
      const srcFile = path.join(src, fileName);
      if (path.extname(srcFile) === '.json') {
        const namespace = this.getNamespace(fileName);
        const newTgtDir = path.join(parentFolder, namespace);
        await fs.mkdirp(newTgtDir);
        return await this.copyFile(srcFile, newTgtDir, true, language);
      }
    });
    return await Promise.all(promises);
  }

  /**
   * Update the hash in the locale mappings for a file copy
   *
   * @param {string} tgt - target folder for the locale file
   * @param {string} fileName - target file name e.g. 8sj901s.en-US.json
   */
  updateFileHash(tgt, fileName) {
    const tgtFile = path.join(tgt, fileName);
    const pkgName = this.getPackageNameFromDir(tgtFile);
    const [hash, language, ext] = fileName.split('.');

    if (ext) {
      this.builderMap[pkgName] = this.builderMap[pkgName] || {};
      this.builderMap[pkgName][language] = hash;
    }
  }

  /**
   * Copies the source file to proper target location
   *
   * @param {string} src - full path to source file
   * @param {string} tgtDir - target folder location
   * @param {bool} isFolder - true if called from moveFolder, false otherwise
   * @param {string} filePart - this is used for building the target file name. It contains either the language or
   * the file name.
   * @returns {Promise} - resolves once the file is saved
   */
  async copyFile(src, tgtDir, isFolder, filePart) {
    const buffer = await fs.readFile(src);
    const hash = loaderUtils.getHashDigest(buffer, 'md5', 'hex', 7);

    let hashedFileName;
    if (isFolder) {
      hashedFileName = `${hash}.${filePart}.json`;
      this.updateFolderHash(tgtDir, hashedFileName);
    } else {
      hashedFileName = `${hash}.${filePart}`;
      this.updateFileHash(tgtDir, hashedFileName);
    }

    const output = JSON.parse(buffer);
    const tgtFile = path.join(tgtDir, hashedFileName);
    return fsUtils.saveJsonFile(tgtFile, output);
  }

  /**
   * Minifies and sets a unique hash for a file and saves in the target location
   *
   * @param {string} src - Source file path
   * @param {string} tgt - Target file path
   * @returns {Promise} promise
   */
  async moveFile(src, tgt) {
    const newTgtDir = path.dirname(tgt);
    const fileName = path.basename(tgt);
    return await this.copyFile(src, newTgtDir, false, fileName);
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
        return await this.moveFile(srcFile, tgtFile);
      } else if ((await fs.lstat(srcFile)).isDirectory()) {
        return await this.moveFolder(srcFile, tgtFile);
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
   * Returns if the path for locales files is for the main package and not for a sub-package/dependency module.
   *
   * @param {string} srcDir - directory path to the locales folder.
   * @returns {boolean} returns true if the path matches current package path.
   */
  isMainPackage(srcDir) {
    const { localesDir } = this._config;
    return srcDir === path.join(this._rootDir, localesDir);
  }

  /**
   * Processes directories
   *
   * @param {string[]} buildDirs - list of dirs to process
   */
  async processDirs(buildDirs) {
    let defaultModule;
    for (const srcDir of buildDirs) {
      const pkgName = await this.getPackageName(srcDir);
      const tgtDir = path.join(this._outputDir, pkgName);

      this._logger.log(`build:locales: Updating locale files for: ${pkgName}`);

      await fs.remove(tgtDir);
      await fs.mkdirp(tgtDir);
      this.builderMap[pkgName] = {};
      if (this.isMainPackage(srcDir)) {
        defaultModule = pkgName;
      }

      const fileNames = await fs.readdir(srcDir);
      await this.processFiles(srcDir, tgtDir, fileNames);
    }

    this._logger.log(`build:locales: Completed locale files update.`);
    await this.writeManifest(defaultModule);
  }

  async writeManifest(defaultModule) {
    const { localeMap, defaultLocale } = this._config;
    const manifest = {
      localeMap,
      defaultLocale,
      defaultModule,
      moduleHashes: this.builderMap
    };

    await fsUtils.saveJsonFile(this._mapFile, manifest);
    this._logger.log(`build:locales: Wrote locales manifest.`);
  }

  /**
   * Find modules that have /locales folder to process
   *
   * @returns {string[]} directories - list of paths
   */
  async discoverDirs() {
    const { localesDir, blacklistModules } = this._config;
    const dirs = await fsUtils.getDirectories(this._nodeModulesDir);
    dirs.unshift(this._rootDir);

    return dirs.reduce(async (prevPromise, dir) => {
      const resArr = await prevPromise;
      if (blacklistModules.includes(path.basename(dir))) return resArr;
      const buildDir = path.join(dir, localesDir);
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

module.exports = Builder;
