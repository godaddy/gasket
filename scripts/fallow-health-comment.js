import { readFileSync } from 'fs';

const MARKER = '<!-- fallow-health-score -->';
const BADGES = { A: '🟢', B: '🟢', C: '🟡', D: '🟠', F: '🔴' };
const LABELS = {
  unused_deps: 'Unused dependencies',
  unit_size: 'Unit size',
  duplication: 'Duplication',
  coupling: 'Coupling',
  circular_deps: 'Circular dependencies',
  dead_files: 'Dead files',
  dead_exports: 'Dead exports',
  complexity: 'Complexity',
  p90_complexity: 'Complexity (p90)',
  maintainability: 'Maintainability'
};

/**
 * Render the sticky Fallow health comment from a health.json report.
 * The MARKER on line 1 is what the workflow's comment step greps to update the
 * comment in place.
 * @param {string} healthPath - path to the fallow health --format json output
 * @param {string} sha - commit sha shown in the comment footer
 * @returns {string} markdown comment body
 */
function render(healthPath, sha) {
  let health;
  try {
    health = JSON.parse(readFileSync(healthPath, 'utf8')).health_score;
  } catch {
    // Missing/empty/malformed report or absent health_score — degrade to the
    // unavailable notice rather than throwing (the score is informational).
  }

  if (!health) {
    return `${MARKER}\n## 🌱 Fallow Health\n\nScore unavailable for this run.\n`;
  }

  const badge = BADGES[health.grade] || '⚪';
  const rows = Object.entries(health.penalties || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `| ${LABELS[k] || k} | −${v.toFixed(1)} |`);
  const table = rows.length
    ? ['| Check | Penalty |', '|:------|--------:|', ...rows].join('\n')
    : '_No penalties — clean across all checks._';

  return [
    MARKER,
    `## 🌱 Fallow Health: ${badge} ${health.grade} · ${health.score} / 100`,
    '',
    'What is costing points, repo-wide:',
    '',
    table,
    '',
    `<sub>Repo-wide score for trend visibility — not a merge gate. ` +
      `Watch the grade climb as PRs clean up touched files. ` +
      `Updated each push (\`${(sha || '').slice(0, 7)}\`).</sub>`
  ].join('\n');
}

const [healthPath = 'health.json', sha = ''] = process.argv.slice(2);
process.stdout.write(render(healthPath, sha) + '\n');
