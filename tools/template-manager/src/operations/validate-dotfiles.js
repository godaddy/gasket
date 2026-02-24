import { execSync } from 'child_process';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, relative } from 'path';
import chalk from 'chalk';

export const name = 'validate-dotfiles';
export const description = 'Verify dotfiles are packed correctly';
export const emoji = '📄';
export const mode = 'per-template';
/** Sync (execSync, readFileSync) — run one at a time so concurrency log matches behavior. */
export const concurrency = 1;

function parseGitignore(gitignorePath) {
  if (!existsSync(gitignorePath)) return [];
  const content = readFileSync(gitignorePath, 'utf8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(pattern => {
      if (pattern.startsWith('./')) pattern = pattern.slice(2);
      if (pattern.startsWith('!')) pattern = pattern.slice(1);
      return pattern;
    });
}

function isIgnored(name, patterns) {
  for (const pattern of patterns) {
    if (pattern === name) return true;
    if (pattern.endsWith('/') && pattern.slice(0, -1) === name) return true;
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      if (regex.test(name)) return true;
    }
  }
  return false;
}

function findDotFiles(dir, baseDir, ignorePatterns = []) {
  const dotFiles = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (isIgnored(entry.name, ignorePatterns)) continue;
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      dotFiles.push(...findDotFiles(fullPath, baseDir, ignorePatterns));
    } else if (entry.name.startsWith('.')) {
      dotFiles.push(relative(baseDir, fullPath));
    }
  }
  return dotFiles;
}

function getPackedFiles(packageDir) {
  try {
    const output = execSync('npm pack --dry-run --json', {
      cwd: packageDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const packData = JSON.parse(output);
    const files = packData[0]?.files || [];
    return files.map(f => f.path);
  } catch {
    return [];
  }
}

/**
 * @param {object} template
 * @param {object} ctx
 */
export async function handler(template, ctx) {
  const { config } = ctx;
  const { packageDir, templateDir, name: packageName } = template;
  const { expectedDotFiles, allowedUnpackedDotFiles } = config.validateDotfiles ?? {};

  const gitignorePath = join(templateDir, '.gitignore');
  const ignorePatterns = parseGitignore(gitignorePath);

  const dotFiles = findDotFiles(templateDir, packageDir, ignorePatterns);
  const dotFileNames = dotFiles.map(f => f.split('/').pop());

  const missingExpected = (expectedDotFiles ?? []).filter(f => !dotFileNames.includes(f));
  if (missingExpected.length > 0) {
    console.log(chalk.yellow(`  WARNING: expected dot file(s) not found: ${missingExpected.join(', ')}`));
  }

  const packedFiles = getPackedFiles(packageDir);
  const missingFromPack = dotFiles.filter(dotFile => {
    const fileName = dotFile.split('/').pop();
    if ((allowedUnpackedDotFiles ?? []).includes(fileName)) return false;
    return !packedFiles.includes(dotFile);
  });

  if (missingFromPack.length > 0) {
    console.log(chalk.red(`  ERROR: dot file(s) will NOT be packed: ${missingFromPack.join(', ')}`));
    throw new Error(`${packageName}: ${missingFromPack.length} dot file(s) will not be packed`);
  }
}
