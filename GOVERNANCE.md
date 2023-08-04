# Governance

## Levels of Involvement

### Contributor

Anyone who contributes to Gasket, through pull requests, responses to issues,
documentation or otherwise, is a contributor.

### Maintainer

Maintainers have commit permissions. They are responsible for creating release
commits. They also are responsible for maintaining the Gasket
[roadmap](./ROADMAP.md). Finally, they are responsible for closing out issues
that are duplicates, not reproducible or otherwise should not be addressed. New
maintainers are added by existing maintainers at their discretion. If you want
to become a maintainer, start by looking at Gasket's backlog of issues. You can
triage existing issues, provide fixes, and/or create issues that will improve
Gasket for the community at large. You can view the current list of maintainers
in the [Gasket Github group].

### Code Owner

A code owner is a maintainer with an extra level of commitment. Code owners are
expected to make themselves available to review pull requests and discuss
architectural or roadmap changes to Gasket. Code owners also have veto power
over "core" Gasket changes, which we define here as breaking change or major
refactors to the plugin engine or the cli. Code owners are a small group by
design, and new code owners will be added only rarely. Code owners are listed
[here][code owners].

## Consensus-seeking

Different levels of consensus are needed for different kinds of changes. For
small PRs, it is sufficient to get the two approvals you need to merge the PR.

For major design additions or refactors, it is more important to get buy-in from
other contributors before starting. Post in the [Discussions], and allow a few
days for other contributors to weigh in. Your goal here is to 1) get feedback on
your plan before investing the time in a PR and 2) to get buy-in from other
contributors. Once you have addressed blocking feedback and received some
buy-in, you are ready to proceed with code changes.

Roadmap changes require a lengthier discussion: when you propose a roadmap
change, allow at least a week for as many maintainers as possible to respond.
Your goal here should be to get buy-in from all maintainers (with silence
interpreted as approval). In rare cases, there may prove to be irresolvable
disagreement between maintainers, in which case it is acceptable to conduct a
majority vote.

If the design/roadmap change requires a breaking change or major refactor to the
plugin engine or the cli, please tag at least one [code owner][code owners] in
your discussion.

## Working Groups

We anticipate the creation of working groups to give direction and define best
practices for major Gasket feature areas. Here are a few ideas for future
working groups:

* Front-end frameworks: e.g. Nextjs, Svelte
* Feature areas: e.g. Intl, lint

[Discussions]: https://github.com/godaddy/gasket/discussions
[Gasket Github group]: https://github.com/orgs/godaddy/teams/gasket
[code owners]: ./CODEOWNERS
