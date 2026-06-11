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
 * Read the `health_score` from a fallow `health --format json` report.
 * Returns null for a missing, empty, or malformed report rather than throwing
 * (the score is informational, never a hard failure).
 * @param {string} healthPath - path to the fallow health --format json output
 * @returns {object | null} the health_score object, or null when unavailable
 */
function readHealthScore(healthPath) {
  try {
    return JSON.parse(readFileSync(healthPath, 'utf8')).health_score ?? null;
  } catch {
    return null;
  }
}

/**
 * Build the penalty breakdown table: non-zero penalties only, largest first.
 * Falls back to a clean-sweep notice when nothing is costing points.
 * @param {object} penalties - map of penalty key to point cost
 * @returns {string} markdown table, or the no-penalties notice
 */
function penaltyTable(penalties) {
  const rows = Object.entries(penalties || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `| ${LABELS[k] || k} | −${v.toFixed(1)} |`);
  if (!rows.length) return '_No penalties — clean across all checks._';
  return ['| Check | Penalty |', '|:------|--------:|', ...rows].join('\n');
}

/**
 * Render the sticky Fallow health comment from a health.json report.
 * The MARKER on line 1 is what the workflow's comment step greps to update the
 * comment in place.
 * @param {string} healthPath - path to the fallow health --format json output
 * @param {string} sha - commit sha shown in the comment footer
 * @returns {string} markdown comment body
 */
function render(healthPath, sha) {
  const health = readHealthScore(healthPath);
  if (!health) {
    return `${MARKER}\n## 🌱 Fallow Health\n\nScore unavailable for this run.\n`;
  }

  return [
    MARKER,
    `## 🌱 Fallow Health: ${BADGES[health.grade] || '⚪'} ${health.grade} · ${health.score} / 100`,
    '',
    'What is costing points, repo-wide:',
    '',
    penaltyTable(health.penalties),
    '',
    `<sub>Repo-wide score for trend visibility — not a merge gate. ` +
      `Watch the grade climb as PRs clean up touched files. ` +
      `Updated each push (\`${(sha || '').slice(0, 7)}\`).</sub>`
  ].join('\n');
}

const [healthPath = 'health.json', sha = ''] = process.argv.slice(2);
process.stdout.write(render(healthPath, sha) + '\n');
