import path from 'path';
import os from 'os';
import { withSpinner } from '../with-spinner.js';
import { PackageManager } from '@gasket/utils';
import { mkdtemp, cp, readdir, rm } from 'fs/promises';

const VERSION_TAG_REGEX = /@([\^~]?\d+\.\d+\.\d+(?:-[\d\w.-]+)?|[\^~]?\d+\.\d+\.\d+|[a-zA-Z]+|file:.+)$/;
const GASKET_TEMPLATE_PATTERNS = ['/gasket-template-', '@gasket/template-'];
const EXCLUDED_FILES = ['node_modules'];

/**
 * Validates that the template name follows Gasket naming conventions
 * @param {string} template - The template name
 * @throws {Error} If template name is invalid
 */
function validateTemplateName(template) {
  if (template.endsWith('-template')) {
    throw new Error(`Invalid template name: ${template}. Please check the name and try again.`);
  }

  const isValid = GASKET_TEMPLATE_PATTERNS.some(pattern => template.includes(pattern));
  if (!isValid) {
    throw new Error(`Invalid template name: ${template}. Templates must follow naming convention.`);
  }
}

/**
 * Parses template string into name and version components
 * @param {string} template - Template string (e.g., "@gasket/template-api@1.0.0")
 * @returns {{ name: string, version: string }} Parsed template name and version
 */
function parseTemplateNameAndVersion(template) {
  if (!VERSION_TAG_REGEX.test(template)) {
    return { name: template, version: '@latest' };
  }

  const parts = template.split('@').filter(Boolean);
  return {
    name: `@${parts[0]}`,
    version: `@${parts[1]}`
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
 * Copies template files to destination, excluding certain files
 * @param {string} templateDir - Source template directory
 * @param {string} destDir - Destination directory
 * @param {object} context - Gasket context
 * @returns {Promise<void>}
 */
async function copyTemplateFiles(templateDir, destDir, context) {
  const entries = await readdir(templateDir, { withFileTypes: true });
  const filesToCopy = entries.filter(entry => !EXCLUDED_FILES.includes(entry.name));

  for (const entry of filesToCopy) {
    const sourcePath = path.join(templateDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    await cp(sourcePath, destPath, { recursive: true });
    context.generatedFiles.add(path.relative(context.cwd, destPath));
  }
}

/**
 * Downloads and installs a remote template package
 * @param {string} template - Template name with optional version
 * @param {string} appName - App name for temp directory
 * @returns {Promise<{ templateDir: string, templateName: string, tmpDir: string }>} Template installation details
 */
async function installRemoteTemplate(template, appName) {
  validateTemplateName(template);

  const tmpDir = await mkdtemp(path.join(os.tmpdir(), `gasket-template-${appName}`));
  const modPath = path.join(tmpDir, 'node_modules');
  const pkgManager = new PackageManager({
    packageManager: 'npm',
    dest: tmpDir
  });

  const { name, version } = parseTemplateNameAndVersion(template);

  try {
    await pkgManager.exec('install', [`${name}${version}`]);
    return {
      templateDir: path.join(modPath, name, 'template'),
      templateName: `${name}${version}`,
      tmpDir
    };
  } catch (err) {
    await cleanupTempDir(tmpDir);

    const errorMessage = err.stderr || err.message;
    if (err.stderr?.includes('is not in this registry')) {
      const message = `Template not found in registry: ${name}${version}. ` +
        'Use npm_config_registry=<registry> to use privately scoped templates.';
      throw new Error(message);
    }
    throw new Error(`Failed to install template ${name}${version}: ${errorMessage}`);
  }
}

/**
 * Checks if an error is related to peer dependencies
 * @param {Error & { stderr?: string }} error - The error to check
 * @returns {boolean} True if error is peer dep related
 */
function isPeerDependencyError(error) {
  const errorMessage = (error.stderr || error.message || '').toLowerCase();
  return errorMessage.includes('peer dep') ||
         errorMessage.includes('peerinvalid') ||
         errorMessage.includes('peer dependencies') ||
         errorMessage.includes('eresolve');
}

/**
 * Installs dependencies in the destination directory
 * @param {string} dest - Destination directory path
 * @returns {Promise<void>}
 */
async function installDependencies(dest) {
  const destPkgManager = new PackageManager({
    packageManager: 'npm',
    dest
  });

  try {
    await destPkgManager.exec('ci');
  } catch (error) {
    if (isPeerDependencyError(error)) {
      console.warn('Peer dependency conflict detected, retrying with --legacy-peer-deps...');
      try {
        await destPkgManager.exec('ci', ['--legacy-peer-deps']);
      } catch (retryError) {
        throw new Error(`Failed to install dependencies even with --legacy-peer-deps: ${retryError.message}`);
      }
    } else {
      throw error;
    }
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

/**
 * Loads and installs a template (local or remote) into the destination directory
 * @param {object} options - Options object
 * @param {object} options.context - Gasket creation context
 * @returns {Promise<void>}
 */
async function loadTemplate({ context }) {
  if (!context.template && !context.templatePath) return;

  let tmpDir;

  try {
    const { templateDir, templateName, tmpDir: tempDirectory } = await getTemplateDetails(context);
    tmpDir = tempDirectory;

    await copyTemplateFiles(templateDir, context.dest, context);
    await cleanupTempDir(tmpDir);
    await installDependencies(context.dest);

    context.messages.push(`Template ${templateName} installed and dependencies resolved`);
  } catch (err) {
    await cleanupTempDir(tmpDir);
    throw err;
  }
}

export default withSpinner('Load template', loadTemplate);
