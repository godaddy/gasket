import path from 'path';
import os from 'os';
import { withSpinner } from '../with-spinner.js';
import { PackageManager } from '@gasket/utils';
import { mkdtemp, cp, readdir, rm } from 'fs/promises';

const hasVersionOrTag = /@([\^~]?\d+\.\d+\.\d+(?:-[\d\w.-]+)?|[\^~]?\d+\.\d+\.\d+|[a-zA-Z]+|file:.+)$/;

/**
 * validateTemplateName - Validate the template name
 * @param {string} template - The template name
 * @returns {void}
 */
function validateTemplateName(template) {
  const isValidName = template.includes('/gasket-template-') || template.includes('@gasket/template-');
  const isMispelled = template.endsWith('-template');

  if (isMispelled) {
    throw new Error(`Invalid template name: ${template}. Please check the name and try again.`);
  }

  if (!isValidName) {
    throw new Error(`Invalid template name: ${template}. Templates must follow naming convention.`);
  }
}

async function loadTemplate({ context }) {
  if (!context.template && !context.templatePath) return;

  try {
    let templateDir;
    let templateName;

    if (context.templatePath) {
      // Handle local template path
      templateDir = path.resolve(context.templatePath, 'template');
      templateName = `local template at ${templateDir}`;
    } else {
      // Handle remote template package
      const tmpDir = await mkdtemp(path.join(os.tmpdir(), `gasket-template-${context.appName}`));
      const modPath = path.join(tmpDir, 'node_modules');
      const pkgManager = new PackageManager({
        packageManager: 'npm',
        dest: tmpDir
      });

      const template = context.template;
      validateTemplateName(template);

      const parts = hasVersionOrTag.test(template) && template.split('@').filter(Boolean);
      const name = parts ? `@${parts[0]}` : template;
      const version = parts ? `@${parts[1]}` : '@latest';

      try {
        // Install the template package
        await pkgManager.exec('install', [`${name}${version}`]);
        templateDir = path.join(modPath, name, 'template');
        templateName = `${name}${version}`;

        // Clean up will happen after copying
        context._templateTmpDir = tmpDir;
      } catch (err) {
        // Clean up on error
        await rm(tmpDir, { recursive: true });

        const errorMessage = err.stderr || err.message;
        if (err.stderr && err.stderr.includes('is not in this registry')) {
          throw new Error(`Template not found in registry: ${name}${version}. Use npm_config_registry=<registry> to use privately scoped templates.`);
        }
        throw new Error(`Failed to install template ${name}${version}: ${errorMessage}`);
      }
    }

    // Copy entire template directory to destination (excluding node_modules)
    const entries = await readdir(templateDir, { withFileTypes: true });
    const filesToCopy = entries.filter(entry =>
      entry.name !== 'node_modules'
    );

    for (const entry of filesToCopy) {
      const sourcePath = path.join(templateDir, entry.name);
      const destPath = path.join(context.dest, entry.name);
      await cp(sourcePath, destPath, { recursive: true });
      context.generatedFiles.add(path.relative(context.cwd, destPath));
    }

    // Clean up template temp directory if it was created
    if (context._templateTmpDir) {
      await rm(context._templateTmpDir, { recursive: true });
    }

    // Run npm ci in the destination directory to install dependencies
    const destPkgManager = new PackageManager({
      packageManager: 'npm',
      dest: context.dest
    });
    await destPkgManager.exec('ci');

    context.messages.push(`Template ${templateName} installed and dependencies resolved`);

  } catch (err) {
    // Clean up on error
    if (context._templateTmpDir) {
      try {
        await rm(context._templateTmpDir, { recursive: true });
      } catch {
        // Ignore cleanup errors
      }
    }
    throw err;
  }
}

export default withSpinner('Load template', loadTemplate);
