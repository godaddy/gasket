import fs from 'fs';
import path from 'path';

/**
 * The CreateRuntime represents a shallow proxy to a CreateContext
 * that automatically adds transactional information for providing
 * CLI users with blame information in the event of conflicts.
 * @type {import('../internal.d.ts').makeCreateRuntime}
 */
function makeCreateRuntime(context, source) {
  //
  // Create a set of overrides for our Proxy
  //
  const overrides = {
    source,
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
      // The set trap must return a boolean indicating whether the property was set.
      // Protected keys (pkg, source) are read-only on the runtime proxy; refusing
      // returns false, which throws in strict mode (ESM).
      if (key === 'pkg' || key === 'source') {
        return false;
      }
      obj[key] = value;
      return true;
    }
  });
}


export class CreateContext {
  constructor(initContext = {}) {
    Object.assign(this, initContext);
  }

  runWith(plugin) {
    // @ts-ignore - partial context at this point
    return makeCreateRuntime(this, plugin);
  }
}

/** @type {import('../internal.d.ts').makeCreateContext} */
export function makeCreateContext(argv = [], options = {}) {
  const appName = argv[0] || 'templated-app';
  const {
    template,
    templatePath,
    packageManager
  } = options;

  const cwd = process.cwd();
  const dest = path.join(cwd, appName);
  const relDest = `.${path.sep}${path.relative(cwd, dest)}`;
  // eslint-disable-next-line no-sync
  const extant = fs.existsSync(dest);

  /**
   * Input context passed through the template scaffold actions
   * @type {import('../index.d.ts').CreateContext}
   */
  // @ts-ignore - some properties not defined in constructor will be added later
  const context = new CreateContext({
    destOverride: true,
    cwd,
    dest,
    relDest,
    extant,
    template,
    templatePath,
    messages: [],
    warnings: [],
    errors: [],
    nextSteps: [],
    generatedFiles: new Set()
  });

  if (packageManager) {
    context.packageManager = packageManager;
  }
  if (appName) {
    context.appName = appName;
  }

  return context;
}

