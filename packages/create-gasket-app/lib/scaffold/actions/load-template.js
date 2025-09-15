import path from 'path';
import os from 'os';
import { withSpinner } from '../with-spinner.js';
import { PackageManager } from '@gasket/utils';
import { mkdtemp, rm } from 'fs/promises';

const VERSION_TAG_REGEX = /@([\^~]?\d+\.\d+\.\d+(?:-[\d\w.-]+)?|[\^~]?\d+\.\d+\.\d+|[a-zA-Z]+|file:.+)$/;

/**
 * Parses template string into name and version components
 * @param {string} template - Template string (e.g., "@gasket/template-api@1.0.0")
 * @returns {{ name: string, version: string }} Parsed template name and version
 */
function parseTemplateNameAndVersion(template) {
  if (!VERSION_TAG_REGEX.test(template)) {
    return { name: template, version: 'latest' };
  }

  // capture name and version, excluding `@`
  const reNameVersion = /(^.[^@]+)[@](.+$)/i;
  const [
    name,
    version = 'latest'
  ] = template.split(reNameVersion).filter(Boolean);

  return {
    name,
    version
  };
}

/**
 * Safely cleans up temporary directory
 * @param {string} tmpDir - Temporary directory path
 * @returns {Promise<void>}
 */
async function cleanupTempDir(tmpDir) {
  if (!tmpDir) return;

  try {
    await rm(tmpDir, { recursive: true });
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Downloads and installs a remote template package
 * @param {string} template - Template name with optional version
 * @param {string} appName - App name for temp directory
 * @returns {Promise<{ templateDir: string, templateName: string, tmpDir: string }>} Template installation details
 */
async function installRemoteTemplate(template, appName) {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), `gasket-template-${appName}`));
  const modPath = path.join(tmpDir, 'node_modules');
  const pkgManager = new PackageManager({
    packageManager: 'npm',
    dest: tmpDir
  });

  const { name, version } = parseTemplateNameAndVersion(template);

  try {
    await pkgManager.exec('install', [`${name}@${version}`]);
    return {
      templateDir: path.join(modPath, name, 'template'),
      templateName: `${name}@${version}`,
      tmpDir
    };
  } catch (err) {
    await cleanupTempDir(tmpDir);

    const errorMessage = err.stderr || err.message;
    if (err.stderr?.includes('is not in this registry')) {
      const message = `Template not found in registry: ${name}@${version}. ` +
        'Use npm_config_registry=<registry> to use privately scoped templates.';
      throw new Error(message);
    }
    throw new Error(`Failed to install template ${name}@${version}: ${errorMessage}`);
  }
}

/**
 * Gets template directory and name based on context
 * @param {object} context - Gasket creation context
 * @returns {Promise<{ templateDir: string, templateName: string, tmpDir?: string }>} Template details
 */
async function getTemplateDetails(context) {
  if (context.templatePath) {
    return {
      templateDir: path.resolve(context.templatePath, 'template'),
      templateName: `local template at ${path.resolve(context.templatePath, 'template')}`
    };
  }

  const result = await installRemoteTemplate(context.template, context.appName);
  return {
    templateDir: result.templateDir,
    templateName: result.templateName,
    tmpDir: result.tmpDir
  };
}

/** @type {import('../../internal.d.ts').loadTemplate} */
async function loadTemplate({ context }) {
  if (!context.template && !context.templatePath) return;

  const { templateDir, templateName, tmpDir } = await getTemplateDetails(context);

  // Store template information in context for other actions to use
  context.templateDir = templateDir;
  context.templateName = templateName;
  context.tmpDir = tmpDir;

  context.messages.push(`Template ${templateName} loaded`);
}

export default withSpinner('Loading template', loadTemplate);
