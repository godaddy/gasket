import fs from 'fs';
import path from 'path';
import { readConfig } from '../scaffold/utils.js';

/**
 * The CreateRuntime represents a shallow proxy to a CreateContext
 * that automatically adds transactional information for providing
 * CLI users with blame information in the event of conflicts.
 * @type {import('../internal.js').makeCreateRuntime}
 */
function makeCreateRuntime(context, source) {
  //
  // Create a set of overrides for our Proxy
  //
  const overrides = {
    source,
    files: {
      add(...globs) {
        context.files.add({ globs, source });
      }
    },
    pkg: {
      extend(fields) {
        context.pkg.extend(fields, source);
      },

      add(key, value, options) {
        context.pkg.add(key, value, source, options);
      },

      has(key, value) {
        return context.pkg.has(key, value);
      },
      remove(path) {
        context.pkg.remove(path);
      }
    }
  };

  // @ts-ignore - Proxy for CreateContext
  return new Proxy(context, {
    get(obj, key) {
      if (overrides[key]) return overrides[key];
      return obj[key];
    },
    set(obj, key, value) {
      if (key !== 'pkg' && key !== 'files' && key !== 'source') {
        obj[key] = value;
        return true; // The set trap in a Proxy must return a boolean value indicating whether the property was successfully set
      }
    }
  });
}


const flatten = (acc, values) => {
  return acc.concat(values);
};

export class CreateContext {
  constructor(initContext = {}) {
    Object.assign(this, initContext);
  }

  runWith(plugin) {
    // @ts-ignore - partial context at this point
    return makeCreateRuntime(this, plugin);
  }
}

/** @type {import('../internal.js').makeCreateContext} */
export function makeCreateContext(argv = [], options = {}) {
  const appName = argv[0] || 'templated-app';
  const {
    template,
    templatePath,
    npmLink = [],
    packageManager,
    prompts,
    config,
    configFile
  } = options;

  // Flatten the array of array created by the plugins flag – it
  // supports both multiple instances as well as comma-separated lists.
  const pkgLinks = npmLink.reduce(flatten, []);
  const cwd = process.cwd();
  const dest = path.join(cwd, appName);
  const relDest = `.${path.sep}${path.relative(cwd, dest)}`;
  // eslint-disable-next-line no-sync
  const extant = fs.existsSync(dest);

  /**
   * Input context which will be appended by prompts and passed to create hooks
   * @type {import('../index.js').CreateContext}
   */
  // @ts-ignore - some properties not defined in constructor will be added later
  const context = new CreateContext({
    destOverride: true,
    cwd,
    dest,
    relDest,
    extant,
    pkgLinks,
    template,
    templatePath,
    messages: [],
    warnings: [],
    errors: [],
    nextSteps: [],
    generatedFiles: new Set(),
    prompts,
    readme: []
  });

  readConfig(context, { config, configFile });

  if (packageManager) {
    context.packageManager = packageManager;
  }
  if (appName) {
    context.appName = appName;
  }

  return context;
}

