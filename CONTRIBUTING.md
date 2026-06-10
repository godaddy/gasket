# Contributing

Everyone is welcome to contribute to GoDaddy's Open Source Software.
Contributing doesn't just mean submitting pull requests. To get involved you can
report or triage bugs and participate in discussions on the evolution of each
project.

No matter how you want to get involved, we ask that you first learn what's
expected of anyone who participates in the project by reading the Contribution
Guidelines.

## Answering Questions

One of the most important and immediate ways you can support this project is to
answer questions on  [Github][issues]. Whether you're helping a newcomer
understand a feature or troubleshooting an edge case with a seasoned developer,
your knowledge and experience with JS can go a long way to help others.

## Reporting Bugs

**Do not report potential security vulnerabilities here. Refer to
[SECURITY.md](./SECURITY.md) for more details about the process of reporting
security vulnerabilities.**

Before submitting a ticket, please be sure to have a simple replication of the
behavior. If the issue is isolated to one of the dependencies of this project,
please create a Github issue in that project. All dependencies are open source
software and can be easily found through [npm].

Submit a ticket for your issue, assuming one does not already exist:

- Create it on our [Issue Tracker][issues]
- Clearly describe the issue by following the template layout
  - Make sure to include steps to reproduce the bug.
  - A reproducible (unit) test could be helpful in solving the bug.
  - Describe the environment that (re)produced the problem.

> For a bug to be actionable, it needs to be reproducible. If you or
> contributors can't reproduce the bug, try to figure out why. Please take care
> to stay involved in discussions around solving the problem.

## Triaging bugs or contributing code

If you're triaging a bug, try to reduce it. Once a bug can be reproduced, reduce
it to the smallest amount of code possible. Reasoning about a sample or unit
test that reproduces a bug in just a few lines of code is easier than reasoning
about a longer sample.

From a practical perspective, contributions are as simple as:

- Forking the repository on GitHub.
- Making changes to your forked repository.
- When committing, reference your issue (if present) and include a note about
  the fix.
- If possible, and if applicable, please also add/update unit tests for your
  changes.
- Push the changes to your fork and submit a pull request to the 'master' branch
  of the projects' repository.

If you are interested in making a large change and feel unsure about its overall
effect, please make sure to first discuss the change and reach a consensus with
core contributors. Then ask about the best way to go about making the change.

## Code Review

Any open source project relies heavily on code review to improve software
quality:

> All significant changes, by all developers, must be reviewed before they are
> committed to the repository. Code reviews are conducted on GitHub through
> comments on pull requests or commits. The developer responsible for a code
> change is also responsible for making all necessary review-related changes.

Sometimes code reviews will take longer than you would hope for, especially for
larger features. Here are some accepted ways to speed up review times for your
patches:

- Review other people's changes. If you help out, everybody will be more willing
  to do the same for you. Good will is our currency.
- Split your change into multiple smaller changes. The smaller your change, the
  higher the probability that somebody will take a quick look at it.
- Remember that you're asking for valuable time from other professional
  developers.

**Note that anyone is welcome to review and give feedback on a change, but only
people with commit access to the repository can approve it.**

## Attribution of Changes

When contributors submit a change to this project, after that change is
approved, other developers with commit access may commit it for the author. When
doing so, it is important to retain correct attribution of the contribution.
Generally speaking, Git handles attribution automatically.

## Code Documentation

Ensure that every function exposed by a Gasket module is documented and follows
the standards set by [JSDoc]. Finally, please stick to the code style as defined
by the [Godaddy JS styleguide][style].

## Type Safety

Please ensure that all contributed code utilizes our defined type checking method outlined in our [Type Safety with JSDoc document].

## Code Quality

Pull requests run a [Fallow] gate that flags dead code, unused dependencies,
duplication, and complexity. The gate is scoped to the changeset: it only fails
on issues your PR *introduces*. Existing findings in files you didn't touch are
reported as inherited and won't block you. Editing a file that already carries a
finding pulls that finding into scope, so the repo cleans up gradually.

### Handling false positives

A finding is usually real — fix it first. Only reach for suppression once you've
confirmed the code is genuinely used and Fallow's static scan can't see it (the
plugin architecture's dynamic loading and generator templates are the common
cause).

When a false positive is **structural** — a whole directory, a runtime-loaded
pattern, or a recurring export shape — capture it once in `.fallowrc.json` rather
than scattering inline comments:

| Pattern | Config key |
|---------|------------|
| Files loaded at runtime, not statically imported | `dynamicallyLoaded` |
| A directory Fallow shouldn't analyze (e.g. `generator/`) | `ignorePatterns` |
| Exports consumed dynamically across many files | `ignoreExports` (glob + export names) |
| Unused dependency (no comment syntax in `package.json`) | `ignoreDependencies` |

The `ignoreDependencies` entries are deps Fallow's static scan can't see a use
for, grouped by why:

- **`@gasket/plugin-metadata`** — consumed via a `/// <reference types="..." />`
  directive, which the scan doesn't count as a use.
- **Babel toolchain** (`@babel/preset-env`, `@babel/preset-react`,
  `@babel/plugin-transform-runtime`, `@babel/register`, `core-js`,
  `regenerator-runtime`) — referenced from the `babel` key in `package.json` or
  pulled in transitively by the transform, never `import`ed.
- **`npm-check-updates`** — invoked as the `ncu` CLI binary, not imported.
- **`@gasket/template-*`** — loaded by `generate-docs-index` via string paths.
- **eslint shared-config peers** (`@eslint/eslintrc`, `@eslint/js`,
  `eslint-plugin-jsx-a11y`, `eslint-plugin-react`) — transitive peers of the
  `eslint-config-godaddy-*` flat configs, not imported directly.
- **Cross-workspace plugin/sibling deps** (`@gasket/plugin-command`,
  `@gasket/plugin-data`, `@gasket/plugin-docs`, `@gasket/plugin-docusaurus`,
  `@gasket/plugin-dynamic-plugins`, `@gasket/plugin-elastic-apm`,
  `@gasket/plugin-express`, `@gasket/plugin-fastify`, `@gasket/plugin-https`,
  `@gasket/plugin-intl`, `@gasket/plugin-logger`, `@gasket/plugin-nextjs`,
  `@gasket/plugin-webpack`, `@gasket/assets`, `@gasket/data`, `@gasket/intl`,
  `@gasket/nextjs`, `@gasket/react-intl`, `@gasket/request`, `@gasket/utils`,
  `create-gasket-app`, `@godaddy/terminus`, `debug`, `fastify`, `react`,
  `react-intl`) — declared as sibling deps for scaffolding or integration tests
  that load them dynamically. Fallow sees them used in *other* workspaces but not
  the declaring one, and won't auto-remove a dep another workspace imports.

`scripts/generate-docs-index` is added to `ignorePatterns` — it's a private build
tool that `await import()`s every plugin from a filesystem scan, so a static dep
scan flags all of them. Excluding the directory is cleaner than listing each.

Confirm a dep is genuinely used-but-invisible before adding it here — if it's
actually unused, remove it from `package.json` instead.

Inline suppression is the last resort, for a genuine one-off that no config rule
generalizes:

```js
// fallow-ignore-next-line unused-export
export const loadedAtRuntime = () => {};
```

```js
// fallow-ignore-file unused-file
```

### Manual cleanup

Run the gate locally against your PR base, or scan and auto-fix the whole repo:

```bash
# Same check CI runs (use your PR's base branch)
pnpm fallow audit --base origin/next

# See all repo-wide findings
pnpm fallow dead-code --summary

# Auto-fix unused exports and dependencies (files/members stay manual)
pnpm fallow fix --dry-run   # preview
pnpm fallow fix --yes       # apply
```

## Markdown Documentation

Each package should have a `README.md`, with guides and other documents under a
`docs/` directory.

Even though readme's should be functional on their own, consider them as pages
in a book when used with `gasket docs`. Different styles and layouts can result
in a disjointed experience for readers. In general, and certainly for the
top-level README, the following headings should be used.

```md
# Name of package

Short one or two sentence summary.

<!-- A broad description of the plugin or package and the features it enables can
follow with 1-2 paragraphs at most with brief example. More details should be
reserved for [How it works] section below and/or extended files in `docs/`. -->

#### Example

## Installation

Show `pnpm install` steps, and/or mention use with the create command.

## Configuration

### Options

## Guides

<!-- list additional docs -->

- [List of other]
- [markdown files]
- [in docs/ directory]

## Commands

### <name> command

Description of the command

#### Example

## Lifecycles

### <name>

Description of the lifecycle

#### Example

## How it works

Description of what the plugin or package does in 1-3 paragraphs. If more is
required, move to separate `docs/` file(s).

## License

Include a LICENSE.md file and link to it.
```

Some additional rules to note:

- Examples should always use `####` heading (H4)
- Example headings should always begin with "Example"
  - Good:
    - "Example config", "Example with Redux", "Example using Next.js"
  - Bad:
    - "Ex. 1: A thing", "Using Redux", "Next.js component example"
- Never use `inline code` in headings
- Never use `inline code` for links.
- Add 'command' to names of commands in Commands section
  - This will help heading links from other documents, distinguishing from
    lifecycles which many times share the same name.
- jsdocs2md output should go to `docs/API.md`.
- Prefer reference links to inline.
  - This making for easier reading when not using a markdown viewer
  
## Adding new packages to the monorepo

Remember to run the `align-packages` script for new packages. This has been an
issue in the past with `docs-graphs` missing the `publishConfig` field which
messed with `lerna publish`. Without this, we had to step into each package and
manually re-publish the ones that didn't make it out.

## File and Directory Naming

File and directory names should follow kebab-casing. Incorrect naming will
generate a linting error.

```md
new-file.js
example-directory-name/
```

## Submit a changeset

This repository utilizes [changesets] to handle versioning and publishing. 
For detailed information about our changeset workflow, configuration, and limitations, 
please refer to our [changeset documentation](./docs/changeset.md).

### Quick Start

To create a changeset for your pull request:

```bash
pnpm run changeset
```

Follow the prompts to select packages and version bumps, then commit the generated 
changeset file with your PR.

## Publishing

When a pull-request is merged into the `main` branch, the changeset will be used
to determine the next version of the package.

A "Version Packages" pull-request will be automatically created to bump the
versions.
If multiple PRs with changesets are merged, this PR will automatically update to
include all changesets.

When all changes are ready to be published, repo admins can force squash merge
the "Version Packages" PR to main (CI worflows do not run on this automated branch).
This will trigger the CI to publish the packages to npm.

## Additional Resources

- [General GitHub Documentation](https://help.github.com/)
- [GitHub Pull Request documentation](https://help.github.com/send-pull-requests/)
- [JSDoc]

[issues]: https://github.com/godaddy/gasket/issues
[Fallow]: https://github.com/fallow-rs/fallow
[JSDoc]: https://jsdoc.app/
[npm]: http://npmjs.org/
[style]: https://github.com/godaddy/javascript/#godaddy-style
[Type Safety with JSDoc document]: https://github.com/godaddy/gasket/blob/main/docs/jsdoc-type-safety.md
[changesets]: https://github.com/changesets/changesets
