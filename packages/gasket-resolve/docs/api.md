
## Classes

Name | Description
------ | -----------
[Loader] | Utility to load plugins, presets, and other modules with associated metadata
[PackageIdentifier] | Utility class for working with package names and versions
[Resolver] | Utility to help resolve and require modules

## Functions

Name | Description
------ | -----------
[assignPresetConfig(gasket)] | Loads config from presets and assigns to the main config.
[pluginIdentifier()] | Create package identifiers for Gasket plugins
[presetIdentifier()] | Create package identifiers for Gasket presets
[projectIdentifier(projectName, \[type\])] | Create function used to make instances of PackageIdentifier for a project
[flattenPresets(presetInfos)] | Takes list of top-level presets required by an app, and flattens out any that they might extend.

## Typedefs

Name | Description
------ | -----------
[PluginDesc] | The package name with or without version of a plugin.
[PresetDesc] | The package name with or without version of a preset.
[PluginName] | The package name only of a plugin.
[PresetName] | The package name only of a preset.
[ModuleInfo] | Module with meta data
[PluginInfo] | Plugin module with meta data
[PresetInfo] | Preset module with meta data
[PluginConfig] | Presets and plugins to load
[createPackageIdentifier] | Create a new PackageIdentifier instance


## Loader

Utility to load plugins, presets, and other modules with associated metadata

**Kind**: global class  
**Extends**: [`Resolver`]  

* [Loader]
    * [.getModuleInfo(module, moduleName, \[meta\])]
    * [.loadModule(moduleName, \[meta\])]
    * [.loadPlugin(module, \[meta\])]
    * [.loadPreset(module, \[meta\], \[options\])]
    * [.loadConfigured(pluginConfig)]
    * [.resolve(moduleName)]
    * [.require(moduleName)]
    * [.tryResolve(moduleName)]
    * [.tryRequire(moduleName)]


### loader.getModuleInfo(module, moduleName, \[meta\])

Loads a module with additional metadata

**Kind**: instance method of [`Loader`]  
**Returns**: [`ModuleInfo`] - module  

| Param | Type | Description |
| --- | --- | --- |
| module | `object` | Module content |
| moduleName | `string` | Name of module to load |
| \[meta\] | `object` | Additional meta data |


### loader.loadModule(moduleName, \[meta\])

Loads a module with additional metadata

**Kind**: instance method of [`Loader`]  
**Returns**: [`ModuleInfo`] - module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `string` | Name of module to load |
| \[meta\] | `object` | Additional meta data |


### loader.loadPlugin(module, \[meta\])

Loads a plugin with additional metadata.

**Kind**: instance method of [`Loader`]  
**Returns**: [`PluginInfo`] - module  

| Param | Type | Description |
| --- | --- | --- |
| module | [`PluginName`] \| `object` | Name of module to load (or module content) |
| \[meta\] | `object` | Additional meta data |


### loader.loadPreset(module, \[meta\], \[options\])

Loads a preset with additional metadata

**Kind**: instance method of [`Loader`]  
**Returns**: [`PresetInfo`] - module  

| Param | Type | Description |
| --- | --- | --- |
| module | [`PresetName`] | Name of module to load |
| \[meta\] | `object` | Additional meta data |
| \[options\] | `boolean` | Loading options |
| \[options.shallow\] | `boolean` | Do not recursively load dependencies |


### loader.loadConfigured(pluginConfig)

Loads presets and plugins as configured.
Plugins will be filtered and ordered as configuration with priority of:
 - added plugins > preset plugins > nested preset plugins

**Kind**: instance method of [`Loader`]  
**Returns**: `Object` - results  

| Param | Type | Description |
| --- | --- | --- |
| pluginConfig | [`PluginConfig`] | Presets and plugins to load |


### loader.resolve(moduleName)

Returns the resolved module filename

**Kind**: instance method of [`Loader`]  
**Overrides**: `resolve`  
**Returns**: `string` - filename of the module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `string` | name of the module |


### loader.require(moduleName)

Returns the required module

**Kind**: instance method of [`Loader`]  
**Overrides**: `require`  
**Returns**: `object` - module contents  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `string` | name of the module |


### loader.tryResolve(moduleName)

Returns the resolved module filename, or null if not found

**Kind**: instance method of [`Loader`]  
**Overrides**: `tryResolve`  
**Returns**: `string` ⎮ `null` - filename of the module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `string` | name of the module |


### loader.tryRequire(moduleName)

Returns the required module, or null if not found

**Kind**: instance method of [`Loader`]  
**Overrides**: `tryRequire`  
**Returns**: `object` ⎮ `null` - module contents  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `string` | name of the module |


## PackageIdentifier

Utility class for working with package names and versions

**Kind**: global class  

* [PackageIdentifier]
    * [.rawName]
    * [.fullName]
    * [.longName]
    * [.shortName]
    * [.name]
    * [.version]
    * [.full]
    * [.withVersion(\[defaultVersion\])]
    * [.nextFormat()]


### packageIdentifier.rawName

Get the package name as provided to the identifier

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - rawName  

### packageIdentifier.fullName

Get the long package name

Examples:
- @gasket/plugin-https@1.2.3 -> @gasket/plugin-https
- @gasket/https -> @gasket/plugin-https
- @user/https -> @user/gasket-plugin-https
- https -> gasket-plugin-https

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - fullName  

### packageIdentifier.longName

Alias to this.fullName

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - fullName  

### packageIdentifier.shortName

Get the short package name

Examples:
- @gasket/plugin-https -> @gasket/https
- @user/gasket-plugin-https -> @user/https
- gasket-plugin-https@1.2.3 -> https

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - fullName  

### packageIdentifier.name

Get only the package name

Examples:
- @gasket/plugin-https@1.2.3 -> @gasket/plugin-https
- https@1.2.3 -> https

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - fullName  

### packageIdentifier.version

Get only the package version

Examples:
- @gasket/plugin-https@1.2.3 -> 1.2.3
- @gasket/plugin-https -> ''

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` ⎮ `null` - fullName  

### packageIdentifier.full

Get the full package name with version

Examples:
- @gasket/plugin-https@1.2.3 -> @gasket/plugin-https@1.2.3
- https@1.2.3 -> @gasket/plugin-https@1.2.3

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - fullName  

### packageIdentifier.withVersion(\[defaultVersion\])

Returns new PackageIdentifier with version added to desc if missing

Examples:
- @gasket/plugin-https@1.2.3 -> @gasket/plugin-https@1.2.3
- @gasket/plugin-https -> @gasket/plugin-https@latest

**Kind**: instance method of [`PackageIdentifier`]  
**Returns**: [`PackageIdentifier`] - identifier  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| \[defaultVersion\] | `string` | `'latest'` | the version name to add if missing |


### packageIdentifier.nextFormat()

If the rawName is a short name, get a new identifier, cycling through
formats which can be used to attempt to resolve packages by different
name pattern.

Examples:
- example -> gasket-plugin-example > example-gasket-plugin > @gasket/plugin-example > @gasket/example-plugin
- @gasket/example -> @gasket/plugin-example > @gasket/example-plugin
- @user/example -> @user/gasket-plugin-example > @user/example-gasket-plugin

**Kind**: instance method of [`PackageIdentifier`]  
**Returns**: [`PackageIdentifier`] ⎮ `null` - identifier  

## Resolver

Utility to help resolve and require modules

**Kind**: global class  

* [Resolver]
    * [new Resolver(options)]
    * [.resolve(moduleName)]
    * [.require(moduleName)]
    * [.tryResolve(moduleName)]
    * [.tryRequire(moduleName)]


### new Resolver(options)


| Param | Type | Description |
| --- | --- | --- |
| options | `object` | Options |
| \[options.resolveFrom\] | `string` \| `Array.<string>` | Path(s) to resolve modules from |
| \[options.require\] | `function` | Require instance to use |


### resolver.resolve(moduleName)

Returns the resolved module filename

**Kind**: instance method of [`Resolver`]  
**Returns**: `string` - filename of the module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `string` | name of the module |


### resolver.require(moduleName)

Returns the required module

**Kind**: instance method of [`Resolver`]  
**Returns**: `object` - module contents  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `string` | name of the module |


### resolver.tryResolve(moduleName)

Returns the resolved module filename, or null if not found

**Kind**: instance method of [`Resolver`]  
**Returns**: `string` ⎮ `null` - filename of the module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `string` | name of the module |


### resolver.tryRequire(moduleName)

Returns the required module, or null if not found

**Kind**: instance method of [`Resolver`]  
**Returns**: `object` ⎮ `null` - module contents  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `string` | name of the module |


## assignPresetConfig(gasket)

Loads config from presets and assigns to the main config.

Merge priority order being:
- loaded file config > preset configs > child preset configs

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| gasket | `Gasket` | Gasket engine instance |


## pluginIdentifier()

Create package identifiers for Gasket plugins

**Kind**: global function  

## presetIdentifier()

Create package identifiers for Gasket presets

**Kind**: global function  

## projectIdentifier(projectName, \[type\])

Create function used to make instances of PackageIdentifier for a project

The `projectName` and `type` are components of the naming convention such as
- `@<projectName>/<type>-<name>`
- `@<user-scope>/<projectName>-<type>-<name>`
- `<projectName>-<type>-<name>`

If a package belongs to the project, it should use `projectName` in its scope.
For user plugins, the `projectName` will be paired with the `type`.

**Kind**: global function  
**Returns**: [`createPackageIdentifier`] - function to make  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| projectName | `string` |  | Name of the project scope and base name |
| \[type\] | `string` | `'plugin'` | Defaults to 'plugin'. |


### projectIdentifier~setupProjectVars()

Setup project level variables

**Kind**: inner method of [`projectIdentifier`]  
**Returns**: `object` - vars  

## flattenPresets(presetInfos)

Takes list of top-level presets required by an app, and flattens out any that
they might extend.

Presets are ordered by extended depth, with deeper later.

**Kind**: global function  
**Returns**: `Array.<PresetInfo>` - flattened presetInfos  

| Param | Type | Description |
| --- | --- | --- |
| presetInfos | `Array.<PresetInfo>` | Array of preset infos |


## PluginDesc

The package name with or without version of a plugin.

For example:
  - @gasket/plugin-https        - fullName
  - @gasket/https               - shortName
  - @gasket/plugin-https@^1.2.3 - full with version
  - @gasket/https@^1.2.3        - short with version
  - gasket-plugin-https         - user fullName
  - https                       - user shortName

Not intended for use with non-plugin package descriptions.
For example, the following patterns will not work:
  - @gasket/https

**Kind**: global typedef  

## PresetDesc

The package name with or without version of a preset.

For example:
  - @gasket/preset-nextjs        - fullName
  - @gasket/nextjs               - shortName
  - @gasket/preset-nextjs@^1.2.3 - full with version
  - @gasket/nextjs@^1.2.3        - short with version
  - gasket-preset-nextjs         - user fullName
  - nextjs                       - user shortName

**Kind**: global typedef  

## PluginName

The package name only of a plugin.

For example:
  - @gasket/plugin-https        - fullName
  - @gasket/https               - shortName
  - gasket-plugin-https         - user fullName
  - https                       - user shortName

**Kind**: global typedef  

## PresetName

The package name only of a preset.

For example:
  - @gasket/preset-nextjs        - fullName
  - @gasket/nextjs               - shortName
  - gasket-preset-nextjs         - user fullName
  - nextjs                       - user shortName

**Kind**: global typedef  

## ModuleInfo

Module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | `string` | Name of preset |
| module | `object` | Actual module content |
| \[package\] | `object` | Package.json contents |
| \[version\] | `string` | Resolved version |
| \[path\] | `string` | Path to the root of package |
| \[from\] | `string` | Name of module which requires this module |
| \[range\] | `string` | Range by which this module was required |


## PluginInfo

Plugin module with meta data

**Kind**: global typedef  

## PresetInfo

Preset module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| presets | `Array.<PresetInfo>` | Presets that this preset extends |
| plugins | `Array.<PluginInfo>` | Plugins this preset uses |


## PluginConfig

Presets and plugins to load

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| presets | `Array.<PresetName>` | Presets to load and add plugins from |
| add | `Array.<PluginName>` \| `Array.<module>` | Names of plugins to load |
| \[remove\] | `Array.<PluginName>` | Names of plugins to remove (from presets) |


## createPackageIdentifier

Create a new PackageIdentifier instance

**Kind**: global typedef  
**Returns**: [`PackageIdentifier`] - instance  

| Param | Type | Description |
| --- | --- | --- |
| rawName | `string` | Original input name of a package |
| \[options\] | `object` | Options |
| \[options.prefixed\] | `boolean` | Set this to force prefixed format for short names |


* [createPackageIdentifier]
    * [.isValidFullName(maybeFullName)]
    * [.lookup(name, handler)]


### createPackageIdentifier.isValidFullName(maybeFullName)

Static util method to check if a full name is valid

Examples:
- @gasket/plugin-https -> true
- @gasket/plugin-https@1.2.3 -> false
- https -> false

**Kind**: static method of [`createPackageIdentifier`]  
**Returns**: `boolean` - fullName  

| Param | Type | Description |
| --- | --- | --- |
| maybeFullName | `string` | Name to check |


### createPackageIdentifier.lookup(name, handler)

Static util method to loop through format options for short names.
The handler will be provide the next formatted identifier to try,
which should return falsy to continue,
or return truthy to end and return the current identifier.
If the lookup runs out of formats to try, it will return null.

**Kind**: static method of [`createPackageIdentifier`]  
**Returns**: [`PackageIdentifier`] ⎮ `null` - identifier if found or null  

| Param | Type | Description |
| --- | --- | --- |
| name | `string` | Name to check |
| handler | `function` | Attempt to find package current format |

<!-- LINKS -->

[Loader]:#loader
[PackageIdentifier]:#packageidentifier
[Resolver]:#resolver
[PluginDesc]:#plugindesc
[PresetDesc]:#presetdesc
[PluginName]:#pluginname
[PresetName]:#presetname
[ModuleInfo]:#moduleinfo
[PluginInfo]:#plugininfo
[PresetInfo]:#presetinfo
[PluginConfig]:#pluginconfig
[createPackageIdentifier]:#createpackageidentifier
[`Resolver`]:#new-resolveroptions
[`Loader`]:#loader
[`ModuleInfo`]:#moduleinfo
[`PluginInfo`]:#plugininfo
[`PluginName`]:#pluginname
[`PresetInfo`]:#presetinfo
[`PresetName`]:#presetname
[`PluginConfig`]:#pluginconfig
[.rawName]:#packageidentifierrawname
[.fullName]:#packageidentifierfullname
[.longName]:#packageidentifierlongname
[.shortName]:#packageidentifiershortname
[.name]:#packageidentifiername
[.version]:#packageidentifierversion
[.full]:#packageidentifierfull
[`PackageIdentifier`]:#packageidentifier
[`createPackageIdentifier`]:#createpackageidentifier
[`projectIdentifier`]:#projectidentifierprojectname-type
[assignPresetConfig(gasket)]:#assignpresetconfiggasket
[pluginIdentifier()]:#pluginidentifier
[presetIdentifier()]:#presetidentifier
[projectIdentifier(projectName, \[type\])]:#projectidentifierprojectname-type
[flattenPresets(presetInfos)]:#flattenpresetspresetinfos
[.getModuleInfo(module, moduleName, \[meta\])]:#loadergetmoduleinfomodule-modulename-meta
[.loadModule(moduleName, \[meta\])]:#loaderloadmodulemodulename-meta
[.loadPlugin(module, \[meta\])]:#loaderloadpluginmodule-meta
[.loadPreset(module, \[meta\], \[options\])]:#loaderloadpresetmodule-meta-options
[.loadConfigured(pluginConfig)]:#loaderloadconfiguredpluginconfig
[.resolve(moduleName)]:#resolverresolvemodulename
[.require(moduleName)]:#resolverrequiremodulename
[.tryResolve(moduleName)]:#resolvertryresolvemodulename
[.tryRequire(moduleName)]:#resolvertryrequiremodulename
[.withVersion(\[defaultVersion\])]:#packageidentifierwithversiondefaultversion
[.nextFormat()]:#packageidentifiernextformat
[new Resolver(options)]:#new-resolveroptions
[.isValidFullName(maybeFullName)]:#createpackageidentifierisvalidfullnamemaybefullname
[.lookup(name, handler)]:#createpackageidentifierlookupname-handler
