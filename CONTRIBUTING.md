# Contributing

Everyone is welcome to contribute to GoDaddy's Open Source Software.
Contributing doesn’t just mean submitting pull requests. To get involved you can
report or triage bugs and participate in discussions on the evolution of each
project.

No matter how you want to get involved, we ask that you first learn what’s
expected of anyone who participates in the project by reading the Contribution
Guidelines.

**Please Note:** GitHub is for bug reports and contributions primarily - if you
have a support question head over to
[GoDaddy's Open Source Software Slack channel][slack].

## Answering Questions

One of the most important and immediate ways you can support this project is to
answer questions on [Slack][slack] or [Github][issues]. Whether you’re helping a
newcomer understand a feature or troubleshooting an edge case with a seasoned
developer, your knowledge and experience with JS can go a long way to help
others.

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
> contributors can’t reproduce the bug, try to figure out why. Please take care
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
core contributors through [slack]. Then ask about the best way to go about
making the change.

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

- Review other people’s changes. If you help out, everybody will be more willing
  to do the same for you. Good will is our currency.
- Split your change into multiple smaller changes. The smaller your change, the
  higher the probability that somebody will take a quick look at it.
- Ping the change on [slack]. If it is urgent, provide reasons why it is
  important to get this change landed. Remember that you’re asking for valuable
  time from other professional developers.

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

## Markdown Documentation

Each package should have a `README.md`, with guides and other documents under a
`docs/` directory.

Even though readme's should be functional on their own, consider them as pages
in a book when used with `gasket docs`. Different styles and layouts can result
in a disjointed experience for readers. In general, and certainly for the
top-level README, the following headings should be used.

```
# Name of package

Short one or two sentence summary.

<!-- A broad description of the plugin or package and the features it enables can
follow with 1-2 paragraphs at most with brief example. More details should be
reserved for [How it works] section below and/or extended files in `docs/`. -->

#### Example

## Installation

Show `npm i` steps, and/or mention use with the create command.

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

Remember to run the `align-packages` script for new packages. This has been
an issue in the past with `docs-graphs` missing the `publishConfig` field which
messed with `lerna publish`. Without this, we had to step into each package and
manually re-publish the ones that didn’t make it out.

## File and Directory Naming

File and directory names should follow kebab-casing. Incorrect naming will generate a linting error.

```
new-file.js
example-directory-name/
```

# Additional Resources

- [General GitHub Documentation](https://help.github.com/)
- [GitHub Pull Request documentation](https://help.github.com/send-pull-requests/)
- [JSDoc]

[issues]: https://github.com/godaddy/gasket/issues
[slack]: https://godaddy-oss.slack.com/messages/CHXEP5DNH
[JSDoc]: http://usejsdoc.org/
[npm]: http://npmjs.org/
[style]: https://github.com/godaddy/javascript/#godaddy-style
