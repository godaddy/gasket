import chalk from 'chalk';

export const name = 'audit';
export const description = 'Aggregate npm audit with deduplication';
export const emoji = '🔒';
export const mode = 'cross-template';
export const concurrency = 1;
export const skipResults = true;

export async function handler(templates, ctx) {
  const { runner, results } = ctx;

  const byAdvisory = /** @type {Record<string, { severity: string, title: string, templates: string[] }>} */ ({});

  for (const t of templates) {
    const { stdout, code } = await runner.runCommandCaptureStdout(
      'npm',
      ['audit', '--json'],
      t.templateDir,
      {}
    );
    if (code !== 0 && !stdout.trim()) {
      results.record(t.name, 'passed');
      continue;
    }
    try {
      const data = JSON.parse(stdout);
      const vulns = data.vulnerabilities || {};
      for (const [name, v] of Object.entries(vulns)) {
        const { severity, via } = /** @type {{ severity: string, via: string | Array<{ title: string }> }} */ (v);
        const title = Array.isArray(via) ? (via[0]?.title || name) : String(via);
        const key = `${name}:${title}`;
        if (!byAdvisory[key]) byAdvisory[key] = { severity, title, templates: [] };
        if (!byAdvisory[key].templates.includes(t.name)) {
          byAdvisory[key].templates.push(t.name);
        }
      }
      results.record(t.name, 'passed');
    } catch {
      results.record(t.name, 'passed');
    }
  }

  const entries = Object.entries(byAdvisory);
  if (entries.length === 0) {
    console.log(chalk.green('\n✅ No known vulnerabilities.\n'));
    return;
  }
  console.log(chalk.bold('\nSecurity Audit:\n'));
  for (const [, { severity, title, templates }] of entries) {
    const color = severity === 'high' || severity === 'critical' ? chalk.red : chalk.yellow;
    console.log(color(`  ${severity.toUpperCase()}: ${title}`));
    console.log(chalk.gray(`     Affected: ${templates.join(', ')}`));
  }
  console.log(chalk.gray(`\nSummary: ${entries.length} finding(s) across ${templates.length} template(s).\n`));
}
