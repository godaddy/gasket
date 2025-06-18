const fs = require('fs');
const path = require('path');
const md = require('markdown-it')();

const DOCS_DIR = path.join(__dirname, '../docs');
const GENERATED_DOCS_DIR = path.join(DOCS_DIR, 'generated-docs');
const PACKAGES_DIR = path.join(__dirname, '../packages');
const ROOT_README = path.join(__dirname, '../README.md');
const RULES_DIR = path.join(__dirname, '../.cursor/rules');
const REPO_REMOTE = 'https://github.com/godaddy/gasket';

function createGasketDir() {
  const gasketDir = path.join(__dirname, '../.cursor/rules/@gasket');
  if (!fs.existsSync(gasketDir)) {
    fs.mkdirSync(gasketDir, { recursive: true });
  }
  return gasketDir;
}

function createRulesDir() {
  const rulesDir = path.join(__dirname, '../.cursor/rules');
  if (!fs.existsSync(rulesDir)) {
    fs.mkdirSync(rulesDir, { recursive: true });
  }
  return rulesDir;
}

function createDirs() {
  createRulesDir();
  createGasketDir();
}

function getAllMarkdownFiles(dirs, excludeDirs = []) {
  let results = [];
  for (const dir of dirs) {
    // If it's a file, add and continue
    if (fs.statSync(dir).isFile()) {
      if (dir.endsWith('.md')) results.push(dir);
      continue;
    }
    // Otherwise, it's a directory
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of list) {
      if (file.isDirectory()) {
        if (excludeDirs.includes(file.name)) continue;
        results = results.concat(getAllMarkdownFiles([path.join(dir, file.name)], excludeDirs));
      } else if (file.name.endsWith('.md')) {
        results.push(path.join(dir, file.name));
      }
    }
  }
  return results;
}

function formatSnippetsInFile(filePath, rulesDir) {
  const snippets = [];
  let fileNameWithoutExt = path.basename(filePath, '.md');
  let fileNameWithExt = `${fileNameWithoutExt}.md`;
  let atTag = fileNameWithExt;
  let outFileName = fileNameWithoutExt;

  // Special handling for package README.md
  const pkgReadmeMatch = filePath.match(/packages\/(.+?)\/README\.md$/);
  if (pkgReadmeMatch) {
    const pkgDir = path.dirname(filePath);
    const pkgJsonPath = path.join(pkgDir, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        if (pkgJson.name) {
          // Use package name for output and tag, replace / with _ for filename
          outFileName = pkgJson.name;
          atTag = pkgJson.name;
        }
      } catch (e) {
        // fallback to default
      }
    }
  }

  const relPath = path.relative(path.join(__dirname, '..'), filePath);
  const src = fs.readFileSync(filePath, 'utf8');
  const tokens = md.parse(src, {});
  let lastHeading = '';
  let snippetCount = 1;
  let description = '';
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'heading_open') {
      if (tokens[i + 1] && tokens[i + 1].type === 'inline') {
        lastHeading = tokens[i + 1].content.trim();
      }
    }
    if (t.type === 'fence') {
      // Walk backwards to find the nearest non-empty inline or paragraph for description
      for (let j = i - 1; j >= 0; j--) {
        const prev = tokens[j];
        if (prev.type === 'inline' && prev.content.trim()) {
          description = prev.content.trim();
          break;
        }
        if (prev.type === 'paragraph_open') {
          continue;
        }
        if (prev.type === 'heading_open' || prev.type === 'fence') {
          break;
        }
      }
      const title = lastHeading || `Snippet ${snippetCount}`;
      const source = `${REPO_REMOTE}/blob/main/${relPath}`;
      const language = t.info || 'text';
      const code = t.content;
      snippets.push(
        `TITLE: ${title}\n` +
        `DESCRIPTION: ${description}\n` +
        `SOURCE: ${source}\n` +
        `LANGUAGE: ${language}\n` +
        `CODE:\n\`\`\`${language}\n${code}\`\`\`\n` +
        `\n----------------------------------------\n`
      );
      snippetCount++;
    }
  }

  if (snippets.length === 0) return;

  fs.writeFileSync(path.join(rulesDir, `${outFileName}.mdc`),
    `---\n` +
    `description: ${description}\n` +
    `alwaysApply: true\n` +
    `---\n` +
    snippets.join('\n') +
    `\n` +
    `${atTag.includes('@') ? atTag : `@${atTag}`}\n`
  );
  console.log(`Wrote ${snippets.length} snippets to ${rulesDir}/${outFileName}.mdc`);
}

function formatReadmeTables(filePath, rulesDir) {
  const src = fs.readFileSync(filePath, 'utf8');
  const lines = src.split(/\r?\n/);
  const snippets = [];
  let description = '';
  let i = 0;
  while (i < lines.length) {
    // Find a table header (line with | and ---)
    if (
      lines[i].trim().startsWith('|') &&
      lines[i + 1] &&
      lines[i + 1].trim().match(/^\|[\s\-:|]+\|$/)
    ) {
      // Find the heading above the table
      let heading = '';
      for (let j = i - 1; j >= 0; j--) {
        if (lines[j].trim().startsWith('##')) {
          heading = lines[j].replace(/^#+\s*/, '').trim();
          // Look for a paragraph above the heading for description
          for (let k = j - 1; k >= 0; k--) {
            if (lines[k].trim() === '') continue;
            if (!lines[k].trim().startsWith('#')) {
              description = lines[k].trim();
            }
            break;
          }
          break;
        }
      }
      // Capture the table
      let tableLines = [];
      let t = i;
      while (t < lines.length && lines[t].trim().startsWith('|')) {
        tableLines.push(lines[t]);
        t++;
      }
      // Compose snippet
      const title = heading || 'Table';
      const source = `${REPO_REMOTE}/blob/main/README.md`;
      const language = 'markdown';
      const code = tableLines.join('\n');
      snippets.push(
        `TITLE: ${title}\n` +
        `DESCRIPTION: ${description}\n` +
        `SOURCE: ${source}\n` +
        `LANGUAGE: ${language}\n` +
        `CODE:\n\`\`\`${language}\n${code}\`\`\`\n` +
        `\n----------------------------------------\n`
      );
      i = t;
    } else {
      i++;
    }
  }
  if (snippets.length === 0) return;

  fs.writeFileSync(path.join(rulesDir, 'README_tables.mdc'),
    `---\n` +
    `description: ${description}\n` +
    `alwaysApply: true\n` +
    `---\n` +
    snippets.join('\n') +
    `\n` +
    `@README.md\n`
  );
}

function main() {
  // Create dirs if they don't exist
  createDirs();

  // Collect all .md files in docs/ (excluding images/), generated-docs/, and root README.md
  const docsFiles = getAllMarkdownFiles([
    DOCS_DIR,
    GENERATED_DOCS_DIR,
    PACKAGES_DIR,
    ROOT_README
  ],
    [
      'images',
      'node_modules',
      'dist',
      'build',
      'coverage',
      'test',
      'cjs',
    ]).filter((filePath) =>
      !filePath.includes('CHANGELOG.md') &&
      !filePath.includes('CONTRIBUTING.md') &&
      !filePath.includes('CODE_OF_CONDUCT.md') &&
      !filePath.includes('SECURITY.md') &&
      !filePath.includes('LICENSE.md')
    );

  docsFiles.forEach((filePath) => {
    if (filePath === ROOT_README) {
      formatReadmeTables(filePath, RULES_DIR);
    } else {
      formatSnippetsInFile(filePath, RULES_DIR);
    }
  });
}

main();
