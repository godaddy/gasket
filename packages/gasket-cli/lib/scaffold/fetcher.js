const path = require('path');
const fs = require('fs');
const { rename, unlink } = fs.promises;
const tar = require('tar-fs');
const zlib = require('zlib');
const pump = require('pump');
const mkdirp = require('mkdirp');
const debug = require('diagnostics')('gasket:cli:fetcher');
const { PackageManager } = require('@gasket/utils');

/**
 * Simple helper class that can also be re-used in tests for similar
 * file I/O operations
 */
const Fetcher = class Fetcher {
  constructor(opts = {}) {
    this.dir = path.join(opts.tmp || require('os').tmpdir(), this._id());
    debug('tmpdir', this.dir);
  }

  /**
   * Ensures an eventually consistent rm -rf (aka rimraf) of
   * the target sourceDir by atomically moving it into this
   * tmp directory and then spawning a detached child process
   * to remove it.
   * @param  {string} sourceDir Directory within this repository.   *
   * @returns {Promise} result
   */
  async vacuum(sourceDir) {
    const spawn = require('cross-spawn');
    const basename = path.basename(sourceDir);
    const rootDir = path.join(__dirname, '..', '..');

    if (!sourceDir.startsWith(rootDir)) {
      console.error('Refusing to rimraf vacuum unsafe directory: ', sourceDir);
      return;
    }

    await mkdirp(this.dir);
    try {
      await rename(sourceDir, path.join(this.dir, basename));
    } catch (err) {
      if (err.code === 'ENOENT') return;
      throw err;
    }

    const rm = spawn(process.execPath, [
      require.resolve('rimraf/bin.js'),
      this.dir
    ], { detached: true });

    rm.on('error', err => {
      console.error(`Error removing ${this.dir}: ${err.message}`);
    });
  }

  /**
   * Returns a reasonably unique name for a subdirectory in `os.tmpdir()`
   * @returns {String} Reasonably unique name
   * @private
   */
  _id() {
    return `gasket-${process.hrtime().join('-')}`;
  }
};


/**
 * Package fetcher that represents the core file system logic
 * for getting npm packages without having to perform a
 * configuration.
 *
 * @type {PackageFetcher}
 * @public
 */
module.exports = class PackageFetcher {
  constructor(opts = {}) {
    this.cwd = opts.cwd || process.cwd();
    this.packageName = opts.packageName;
    this.tmp = new Fetcher(opts);
    this.npmconfig = opts.npmconfig;
    debug('init', this.packageName, this.tmp.dir);
  }

  /**
   * Simple wrapper around clone that also reads the package.json
   * from disk once it has been downloaded.
   *
   * @returns {Promise<Object>} Parsed package.json for the fetched package.
   */
  async readPackage() {
    const dest = await this.clone();
    return require(path.join(dest, 'package.json'));
  }

  /**
   * Critical path file system operations to pull down the npm package
   * that represents the desired gasket scaffold, `this.packageName`. The logic
   * revolves around the assumption:
   *
   * 1. Move (i.e. rename(2)) is the only truly atomic file system operation.
   *
   * Since we use `npm` as the baseline the algorithm becomes:
   *
   * 1. Create the target `tmp` directory to untar into
   * 2. Fetch the tarball using `npm pack` directly as a child process
   * 3. Unpack the tarball into the target `tmp` directory
   *   - All `npm` package tarbals have a nested "package" directory in them.
   * 4. Remove the tarball created by `npm pack`.
   *
   * @returns {Promise<string>} Full path of the cloned destination on local disk.
   * @public
   */
  async clone() {
    await mkdirp(this.tmp.dir);

    const tarballFile = await this.fetch(this.packageName, this.tmp.dir);
    const tarball = path.join(this.tmp.dir, tarballFile);

    await this.unpack(tarball, this.tmp.dir);

    try {
      await unlink(tarball);
    } catch (e) {
      // eslint ignore no-empty
    }

    return path.join(this.tmp.dir, 'package');
  }

  /**
   * Fetch the tarball for the scaffold
   *
   * @param {string} packageName An npm package name (e.g. @gasket/app-template).
   * @param {string} [dir] Directory the package needs to be downloaded.
   * @returns {Promise} A promise represents if fetch succeeds or fails
   * @public
   */
  async fetch(packageName = this.packageName, dir = this.cwd) {
    const argv = [
      'pack', packageName,
      '--loglevel', 'error',
      '--prefer-online'
    ];

    if (this.npmconfig) argv.push('--userconfig', this.npmconfig);

    const { stdout } = await PackageManager.spawnNpm(argv, {
      cwd: dir
    }).catch(err => {
      // TODO: dump npm stdout and stderr to a more useful location.
      throw new Error(`Failed to fetch ${packageName}: npm exited with non-zero code\n${err.stdout}\n\n${err.stderr}`);
    });

    // Remark: we should **always** get a tarball, but is it
    // worthwhile to validate that assumption?
    return stdout.split('\n').filter(Boolean)[0];
  }

  /**
   * Unpack the tarball into given directory.
   *
   * Used from https://github.com/ywangii/await-targz under MIT.
   *
   * @param {String} tarball Path for tarball to be extracted
   * @param {String} dir Path for the file to be extracted
   * @returns {Promise} A promise represents if unpack tarball succeeds or fails
   * @public
   */
  async unpack(tarball, dir) {
    return {
      then: async (fulfill, reject) => {
        const logOpts = { tarball, dir };
        const readableStream = fs.createReadStream(tarball).once('error', this._logError(`fs.createReadStream`, logOpts));
        const unzip = zlib.createUnzip().once('error', this._logError(`zlib.createUnzip`, logOpts));
        const extract = tar.extract(dir).once('error', this._logError(`tar.extract`, logOpts));

        pump(readableStream, unzip, extract, err => {
          if (err) return reject(err);
          fulfill();
        });
      }
    };
  }

  /*
   * Simple logging helper for streams.
   */
  _logError(msg, context) {
    return err => { console.log(msg, context, err); };
  }
};

//
// Expose Fetcher onto the exports for re-use
//
module.exports.Fetcher = Fetcher;
