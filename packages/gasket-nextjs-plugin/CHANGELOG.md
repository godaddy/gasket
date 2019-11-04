# `@gasket/nextjs-plugin`

- Bump to `next@9.1.2` to fix hanging `gasket build`

### 2.3.2

- Fix package.json scripts to wrap glob patterns in double-quotes

### 2.3.0

- Support `gasket.command` interface change ([#75])

### 2.2.0

- Use `next@9` for new apps

### 2.1.0

- Align package structure and dependencies

### 2.0.2

- [#33] Add required dependencies during `gasket create`

### 2.0.1

- [#32] Do not build with `gasket local` command

### 2.0.0

- [#23] Dismantling core-plugin

### 1.1.1

- Fix for missing dependency during create command

### 1.1.0

- Renaming hooks and removing the `webpack` hook
- Separate next plugins from core
- Initial release.

[#23]: https://github.com/godaddy/gasket/pull/23
[#32]: https://github.com/godaddy/gasket/pull/32
[#33]: https://github.com/godaddy/gasket/pull/33
[#75]: https://github.com/godaddy/gasket/pull/75
