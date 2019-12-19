
## Classes

Name | Description
------ | -----------
[Loader] | Utility to load plugins, presets, and other modules with associated metadata
[PackageIdentifier] | Utility class for working with package names and versions
[Resolver] | Utility to help resolve and require modules

## Functions

Name | Description
------ | -----------
[pluginIdentifier()] | Create package identifiers for Gasket plugins
[presetIdentifier()] | Create package identifiers for Gasket presets

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
[createPackageIdentifier] | Create a new PackageIdentifier instance


## Loader : [`Loader`]

Utility to load plugins, presets, and other modules with associated metadata

**Kind**: global class  
**Extends**: [`Resolver`]  

* [Loader]
    * [.getModuleInfo(module, moduleName, [meta])][1]
    * [.loadModule(moduleName, [meta])][2]
    * [.loadPlugin(module, [meta])][3]
    * [.loadPreset(module, [meta], [options])][4]
    * [.loadConfigured(config)]
    * [.resolve(moduleName)]
    * [.require(moduleName)]
    * [.tryResolve(moduleName)]
    * [.tryRequire(moduleName)]


### loader.getModuleInfo(module, moduleName, [meta]) ⇒ `ModuleInfo`

Loads a module with additional metadata

**Kind**: instance method of [`Loader`]  
**Returns**: [`ModuleInfo`] - module  

| Param | Type | Description |
| --- | --- | --- |
| module | `String` | Module content |
| moduleName | `String` | Name of module to load |
| \[meta\] | `Object` | Additional meta data |


### loader.loadModule(moduleName, [meta]) ⇒ `ModuleInfo`

Loads a module with additional metadata

**Kind**: instance method of [`Loader`]  
**Returns**: [`ModuleInfo`] - module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `String` | Name of module to load |
| \[meta\] | `Object` | Additional meta data |


### loader.loadPlugin(module, [meta]) ⇒ `PluginInfo`

Loads a plugin with additional metadata.

**Kind**: instance method of [`Loader`]  
**Returns**: [`PluginInfo`] - module  

| Param | Type | Description |
| --- | --- | --- |
| module | [`PluginName`] \| `Object` | Name of module to load (or module content) |
| \[meta\] | `Object` | Additional meta data |


### loader.loadPreset(module, [meta], [options]) ⇒ `PresetInfo`

Loads a preset with additional metadata

**Kind**: instance method of [`Loader`]  
**Returns**: [`PresetInfo`] - module  

| Param | Type | Description |
| --- | --- | --- |
| module | [`PresetName`] | Name of module to load |
| \[meta\] | `Object` | Additional meta data |
| \[options\] | `Boolean` | Loading options |
| \[options.shallow\] | `Boolean` | Do not recursively load dependencies |


### loader.loadConfigured(config) ⇒ `Object`

Loads presets and plugins as configured.
Plugins will be filtered and ordered as configuration with priority of:
 - added plugins > preset plugins > nested preset plugins

**Kind**: instance method of [`Loader`]  
**Returns**: `Object` - results  

| Param | Type | Description |
| --- | --- | --- |
| config | `Object` | Presets and plugins to load |
| config.presets | `Array.<PresetName>` | Presets to load and add plugins from |
| config.add | `Array.<PluginName>` \| `Array.<module>` | Names of plugins to load |
| config.remove | `Array.<string>` | Names of plugins to remove (from presets) |


### loader.resolve(moduleName) ⇒ `String`

Returns the resolved module filename

**Kind**: instance method of [`Loader`]  
**Overrides**: `resolve`  
**Returns**: `String` - filename of the module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `String` | name of the module |


### loader.require(moduleName) ⇒ `Object`

Returns the required module

**Kind**: instance method of [`Loader`]  
**Overrides**: `require`  
**Returns**: `Object` - module contents  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `String` | name of the module |


### loader.tryResolve(moduleName) ⇒ `String` ⎮ `null`

Returns the resolved module filename, or null if not found

**Kind**: instance method of [`Loader`]  
**Overrides**: `tryResolve`  
**Returns**: `String` ⎮ `null` - filename of the module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `String` | name of the module |


### loader.tryRequire(moduleName) ⇒ `Object` ⎮ `null`

Returns the required module, or null if not found

**Kind**: instance method of [`Loader`]  
**Overrides**: `tryRequire`  
**Returns**: `Object` ⎮ `null` - module contents  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `String` | name of the module |


## PackageIdentifier : [`PackageIdentifier`]

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
    * [.withVersion([defaultVersion])][5]
    * [.nextFormat()]


### packageIdentifier.rawName ⇒ `string`

Get the package name as provided to the identifier

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - rawName  

### packageIdentifier.fullName ⇒ `string`

Get the long package name

Examples:
- @gasket/plugin-https@1.2.3 -> @gasket/plugin-https
- @gasket/https -> @gasket/plugin-https
- @user/https -> @user/gasket-plugin-https
- https -> gasket-plugin-https

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - fullName  

### packageIdentifier.longName ⇒ `string`

Alias to this.fullName

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - fullName  

### packageIdentifier.shortName ⇒ `string`

Get the short package name

Examples:
- @gasket/plugin-https -> @gasket/https
- @user/gasket-plugin-https -> @user/https
- gasket-plugin-https@1.2.3 -> https

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - fullName  

### packageIdentifier.name ⇒ `string`

Get only the package name

Examples:
- @gasket/plugin-https@1.2.3 -> @gasket/plugin-https
- https@1.2.3 -> https

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - fullName  

### packageIdentifier.version ⇒ `string`

Get only the package version

Examples:
- @gasket/plugin-https@1.2.3 -> 1.2.3
- @gasket/plugin-https -> ''

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - fullName  

### packageIdentifier.full ⇒ `string`

Get the full package name with version

Examples:
- @gasket/plugin-https@1.2.3 -> @gasket/plugin-https@1.2.3
- https@1.2.3 -> @gasket/plugin-https@1.2.3

**Kind**: instance property of [`PackageIdentifier`]  
**Returns**: `string` - fullName  

### packageIdentifier.withVersion([defaultVersion]) ⇒ `PackageIdentifier`

Returns new PackageIdentifier with version added to desc if missing

Examples:
- @gasket/plugin-https@1.2.3 -> @gasket/plugin-https@1.2.3
- @gasket/plugin-https -> @gasket/plugin-https@latest

**Kind**: instance method of [`PackageIdentifier`]  
**Returns**: [`PackageIdentifier`] - identifier  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| \[defaultVersion\] | `string` | `'latest'` | the version name to add if missing |


### packageIdentifier.nextFormat() ⇒ `PackageIdentifier` ⎮ `null`

If the rawName is a short name, get a new identifier, cycling through
formats which can be used to attempt to resolve packages by different
name pattern.

Examples:
- example -> gasket-plugin-example > example-gasket-plugin > @gasket/plugin-example > @gasket/example-plugin
- @gasket/example -> @gasket/plugin-example > @gasket/example-plugin
- @user/example -> @user/gasket-plugin-example > @user/example-gasket-plugin

**Kind**: instance method of [`PackageIdentifier`]  
**Returns**: [`PackageIdentifier`] ⎮ `null` - identifier  

## Resolver : [`Resolver`]

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
| options | `Object` | Options |
| \[options.resolveFrom\] | `String` \| `Array.<String>` | Path(s) to resolve modules from |
| \[options.require\] | `require` | Require instance to use |


### resolver.resolve(moduleName) ⇒ `String`

Returns the resolved module filename

**Kind**: instance method of [`Resolver`]  
**Returns**: `String` - filename of the module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `String` | name of the module |


### resolver.require(moduleName) ⇒ `Object`

Returns the required module

**Kind**: instance method of [`Resolver`]  
**Returns**: `Object` - module contents  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `String` | name of the module |


### resolver.tryResolve(moduleName) ⇒ `String` ⎮ `null`

Returns the resolved module filename, or null if not found

**Kind**: instance method of [`Resolver`]  
**Returns**: `String` ⎮ `null` - filename of the module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `String` | name of the module |


### resolver.tryRequire(moduleName) ⇒ `Object` ⎮ `null`

Returns the required module, or null if not found

**Kind**: instance method of [`Resolver`]  
**Returns**: `Object` ⎮ `null` - module contents  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | `String` | name of the module |


## pluginIdentifier() : [`createPackageIdentifier`]

Create package identifiers for Gasket plugins

**Kind**: global function  

## presetIdentifier() : [`createPackageIdentifier`]

Create package identifiers for Gasket presets

**Kind**: global function  

## PluginDesc : `String`

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

## PresetDesc : `String`

The package name with or without version of a preset.

For example:
  - @gasket/preset-nextjs        - fullName
  - @gasket/nextjs               - shortName
  - @gasket/preset-nextjs@^1.2.3 - full with version
  - @gasket/nextjs@^1.2.3        - short with version
  - gasket-preset-nextjs         - user fullName
  - nextjs                       - user shortName

**Kind**: global typedef  

## PluginName : `String`

The package name only of a plugin.

For example:
  - @gasket/plugin-https        - fullName
  - @gasket/https               - shortName
  - gasket-plugin-https         - user fullName
  - https                       - user shortName

**Kind**: global typedef  

## PresetName : `String`

The package name only of a preset.

For example:
  - @gasket/preset-nextjs        - fullName
  - @gasket/nextjs               - shortName
  - gasket-preset-nextjs         - user fullName
  - nextjs                       - user shortName

**Kind**: global typedef  

## ModuleInfo : `Object`

Module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | `String` | Name of preset |
| module | `String` | Actual module content |
| \[package\] | `String` | Package.json contents |
| \[version\] | `String` | Resolved version |
| \[path\] | `String` | Path to the root of package |
| \[from\] | `String` | Name of module which requires this module |
| \[range\] | `String` | Range by which this module was required |


## PluginInfo : [`ModuleInfo`]

Plugin module with meta data

**Kind**: global typedef  

## PresetInfo : [`ModuleInfo`]

Preset module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| presets | `Array.<PresetInfo>` | Presets that this preset extends |
| plugins | `Array.<PluginInfo>` | Plugins this preset uses |


## createPackageIdentifier ⇒ [`PackageIdentifier`]

Create a new PackageIdentifier instance

**Kind**: global typedef  
**Returns**: [`PackageIdentifier`] - instance  

| Param | Type | Description |
| --- | --- | --- |
| rawName | `String` | Original input name of a package |
| \[options\] | `Object` | Options |
| \[options.prefixed\] | `boolean` | Set this to force prefixed/postfixed format for short names |


* [createPackageIdentifier]
    * [.isValidFullName(maybeFullName)]
    * [.lookup(name, handler)]


### createPackageIdentifier.isValidFullName(maybeFullName) ⇒ `boolean`

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


### createPackageIdentifier.lookup(name, handler) ⇒ `PackageIdentifier` ⎮ `null`

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

[Loader]:#loader--loader
[PackageIdentifier]:#packageidentifier--packageidentifier
[Resolver]:#resolver--resolver
[pluginIdentifier()]:#pluginidentifier--createpackageidentifier
[presetIdentifier()]:#presetidentifier--createpackageidentifier
[PluginDesc]:#plugindesc--string
[PresetDesc]:#presetdesc--string
[PluginName]:#pluginname--string
[PresetName]:#presetname--string
[ModuleInfo]:#moduleinfo--object
[PluginInfo]:#plugininfo--moduleinfo
[PresetInfo]:#presetinfo--moduleinfo
[createPackageIdentifier]:#createpackageidentifier--packageidentifier
[`Loader`]:#loader--loader
[`Resolver`]:#new-resolveroptions
[1]:#loadergetmoduleinfomodule-modulename-meta--moduleinfo
[2]:#loaderloadmodulemodulename-meta--moduleinfo
[3]:#loaderloadpluginmodule-meta--plugininfo
[4]:#loaderloadpresetmodule-meta-options--presetinfo
[.loadConfigured(config)]:#loaderloadconfiguredconfig--object
[.resolve(moduleName)]:#resolverresolvemodulename--string
[.require(moduleName)]:#resolverrequiremodulename--object
[.tryResolve(moduleName)]:#resolvertryresolvemodulename--string--null
[.tryRequire(moduleName)]:#resolvertryrequiremodulename--object--null
[`ModuleInfo`]:#moduleinfo--object
[`PluginInfo`]:#plugininfo--moduleinfo
[`PluginName`]:#pluginname--string
[`PresetInfo`]:#presetinfo--moduleinfo
[`PresetName`]:#presetname--string
[`PackageIdentifier`]:#packageidentifier--packageidentifier
[.rawName]:#packageidentifierrawname--string
[.fullName]:#packageidentifierfullname--string
[.longName]:#packageidentifierlongname--string
[.shortName]:#packageidentifiershortname--string
[.name]:#packageidentifiername--string
[.version]:#packageidentifierversion--string
[.full]:#packageidentifierfull--string
[5]:#packageidentifierwithversiondefaultversion--packageidentifier
[.nextFormat()]:#packageidentifiernextformat--packageidentifier--null
[new Resolver(options)]:#new-resolveroptions
[`createPackageIdentifier`]:#createpackageidentifier--packageidentifier
[.isValidFullName(maybeFullName)]:#createpackageidentifierisvalidfullnamemaybefullname--boolean
[.lookup(name, handler)]:#createpackageidentifierlookupname-handler--packageidentifier--null
