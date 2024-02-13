# Upgrades

Gasket plugins and packages can be connected to one another, so if you find that
you need a change in a major revision of a plugin, it is recommended to just get
everything up to date to avoid unintended conflicts. Otherwise, paying attention
to `peerDependencies` warnings also is a good way to mitigate incompatibilities.

## Major Upgrades

Major upgrades usually require special attention as sometimes code changes in
your apps and plugins may be required. The following guides are sequential and
will help make the necessary changes when upgrading to latest.

- [Upgrade to v6]

> TIP: The first open source release of Gasket was at v5 in order to align all
> packages on the same major version. As a result, there is no v4 of
> `@gasket/cli`, hence no upgrade steps required.

## Minor and Patch Upgrades

The first thing to do is to update all your Gasket dependencies to latest. You
can find out what packages are behind and what the latest versions are, by using
`npm outdated`.

Tools like [npm-check] for npm apps, or yarn's [upgrade-interactive] make this
easy.

First, install `npm-check` globally:

```bash
npm install --global npm-check
```

Then in the root of your Gasket app:

```bash
npm-check -u --latest
```

Select all packages with `@gasket/*` prefix.

> TIP: Take your time with upgrades. Don't try to upgrade everything at once
> which can make debugging difficult if something goes wrong. Instead work in
> sets, For example start with Gasket packages, test things out and commit
> change, then move on to React related packages, then test packages, etc.

For yarn apps:

```bash
yarn upgrade-interactive --latest
```

> TIP: In other guides `yarn` commands can be implied by their `npm` parallels.

<!-- LINKS -->

[upgrade to v6]: upgrade-to-6.md
[npm-check]: https://github.com/dylang/npm-check#npm-check
[upgrade-interactive]: https://yarnpkg.com/lang/en/docs/cli/upgrade-interactive/
