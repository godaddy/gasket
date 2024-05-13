const path = require('path');

/**
 * This is a webpack plugin for gathering bundle size data
 */
class WebpackMetricsPlugin {
  constructor(opts) {
    /** @type {import('@gasket/engine').Gasket} */
    this.gasket = opts.gasket;
  }

  /**
   * Helper function to call the metrics lifecycle
   * @type {import('./internal').handleMetrics}
   */
  async handleMetrics(metrics) {
    // TODO (crobbins): better expose gasket logging utilities to plugins to
    // logging these errors more obvious to future plugin authors.
    this.gasket.exec('metrics', metrics);
  }

  /**
   * This plugin will calculate the sizes of the directories from the webpack
   * bundle sent to the browser and call the metrics lifecycle with the data.
   *
   * Example format of data to emit:
   *
   * { name: '@gasket/canary-app',
   *    event: 'webpack',
   *    data: {
   *     images: { totalSize: 101231, jpg: 101231 },
   *     chunks: { totalSize: 128770, js: 128770 },
   *     runtime: { totalSize: 17671, js: 17671 },
   *     css: { totalSize: 749, css: 749 },
   *     pages: { totalSize: 782744, js: 782744 },
   *     'bundle.svgs': { totalSize: 10188, svgs: 10188 } },
   *   time: 1559323660583 }
   * @type {import('./internal').apply}
   */
  apply(compiler) {
    const { target, context } = compiler.options;
    if (target !== 'web') return;

    // eslint-disable-next-line max-statements
    compiler.hooks.emit.tap('WebpackMetricsPlugin', ({ assets }) => {
      const map = {};
      let name;

      try {
        const packagePath = path.join(context, '/package.json');
        const packageJSON = require(packagePath);

        name = packageJSON.name;
      } catch (e) {
        name = 'Gasket App';
      }

      for (const fullpath of Object.keys(assets)) {
        const asset = assets[fullpath];
        const fileSize = asset.size();

        const parsed = path.parse(fullpath);
        const extension = parsed.ext.slice(1);

        let dirname = path.basename(parsed.dir);
        const parent = path.basename(path.dirname(parsed.dir));

        if (parent === 'pages') {
          dirname = parent;
        }

        map[dirname] = map[dirname] || { totalSize: 0 };
        map[dirname].totalSize += fileSize;
        map[dirname][extension] = map[dirname][extension] || 0;
        map[dirname][extension] += fileSize;
      }

      /** @type {import('./index').WebpackMetrics} */
      const metrics = {
        name,
        event: 'webpack',
        data: map,
        time: Date.now()
      };

      // TODO (crobbins): better expose gasket logging utilities to plugins to
      // logging these errors more obvious to future plugin authors.
      this.handleMetrics(metrics).catch(() => {});
    });
  }
}

module.exports = WebpackMetricsPlugin;
