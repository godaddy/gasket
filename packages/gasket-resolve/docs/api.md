## Classes

<dl>
<dt><a href="#Loader">Loader</a> : <code><a href="#Loader">Loader</a></code></dt>
<dd><p>Utility to load plugins, presets, and other modules with associated metadata</p>
</dd>
<dt><a href="#PackageIdentifier">PackageIdentifier</a> : <code><a href="#PackageIdentifier">PackageIdentifier</a></code></dt>
<dd><p>Utility class for working with package names and versions</p>
</dd>
<dt><a href="#Resolver">Resolver</a> : <code><a href="#Resolver">Resolver</a></code></dt>
<dd><p>Utility to help resolve and require modules</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#pluginIdentifier">pluginIdentifier()</a> : <code><a href="#createPackageIdentifier">createPackageIdentifier</a></code></dt>
<dd><p>Create package identifiers for Gasket plugins</p>
</dd>
<dt><a href="#presetIdentifier">presetIdentifier()</a> : <code><a href="#createPackageIdentifier">createPackageIdentifier</a></code></dt>
<dd><p>Create package identifiers for Gasket presets</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#PluginDesc">PluginDesc</a> : <code>String</code></dt>
<dd><p>The package name with or without version of a plugin.</p>
<p>For example:</p>
<ul>
<li>@gasket/plugin-https        - fullName</li>
<li>@gasket/https               - shortName</li>
<li>@gasket/plugin-https@^1.2.3 - full with version</li>
<li>@gasket/https@^1.2.3        - short with version</li>
<li>gasket-plugin-https         - user fullName</li>
<li>https                       - user shortName</li>
</ul>
<p>Not intended for use with non-plugin package descriptions.
For example, the following patterns will not work:</p>
<ul>
<li>@gasket/https</li>
</ul>
</dd>
<dt><a href="#PresetDesc">PresetDesc</a> : <code>String</code></dt>
<dd><p>The package name with or without version of a preset.</p>
<p>For example:</p>
<ul>
<li>@gasket/preset-nextjs        - fullName</li>
<li>@gasket/nextjs               - shortName</li>
<li>@gasket/preset-nextjs@^1.2.3 - full with version</li>
<li>@gasket/nextjs@^1.2.3        - short with version</li>
<li>gasket-preset-nextjs         - user fullName</li>
<li>nextjs                       - user shortName</li>
</ul>
</dd>
<dt><a href="#PluginName">PluginName</a> : <code>String</code></dt>
<dd><p>The package name only of a plugin.</p>
<p>For example:</p>
<ul>
<li>@gasket/plugin-https        - fullName</li>
<li>@gasket/https               - shortName</li>
<li>gasket-plugin-https         - user fullName</li>
<li>https                       - user shortName</li>
</ul>
</dd>
<dt><a href="#PresetName">PresetName</a> : <code>String</code></dt>
<dd><p>The package name only of a preset.</p>
<p>For example:</p>
<ul>
<li>@gasket/preset-nextjs        - fullName</li>
<li>@gasket/nextjs               - shortName</li>
<li>gasket-preset-nextjs         - user fullName</li>
<li>nextjs                       - user shortName</li>
</ul>
</dd>
<dt><a href="#ModuleInfo">ModuleInfo</a> : <code>Object</code></dt>
<dd><p>Module with meta data</p>
</dd>
<dt><a href="#PluginInfo">PluginInfo</a> : <code><a href="#ModuleInfo">ModuleInfo</a></code></dt>
<dd><p>Plugin module with meta data</p>
</dd>
<dt><a href="#PresetInfo">PresetInfo</a> : <code><a href="#ModuleInfo">ModuleInfo</a></code></dt>
<dd><p>Preset module with meta data</p>
</dd>
<dt><a href="#createPackageIdentifier">createPackageIdentifier</a> ⇒ <code><a href="#PackageIdentifier">PackageIdentifier</a></code></dt>
<dd><p>Create a new PackageIdentifier instance</p>
</dd>
</dl>

<a name="Loader"></a>

## Loader : [<code>Loader</code>](#Loader)
Utility to load plugins, presets, and other modules with associated metadata

**Kind**: global class  
**Extends**: [<code>Resolver</code>](#Resolver)  

* [Loader](#Loader) : [<code>Loader</code>](#Loader)
    * [.getModuleInfo(module, moduleName, [meta])](#Loader+getModuleInfo) ⇒ [<code>ModuleInfo</code>](#ModuleInfo)
    * [.loadModule(moduleName, [meta])](#Loader+loadModule) ⇒ [<code>ModuleInfo</code>](#ModuleInfo)
    * [.loadPlugin(module, [meta])](#Loader+loadPlugin) ⇒ [<code>PluginInfo</code>](#PluginInfo)
    * [.loadPreset(module, [meta], [options])](#Loader+loadPreset) ⇒ [<code>PresetInfo</code>](#PresetInfo)
    * [.loadConfigured(config)](#Loader+loadConfigured) ⇒ <code>Object</code>
    * [.resolve(moduleName)](#Resolver+resolve) ⇒ <code>String</code>
    * [.require(moduleName)](#Resolver+require) ⇒ <code>Object</code>
    * [.tryResolve(moduleName)](#Resolver+tryResolve) ⇒ <code>String</code> \| <code>null</code>
    * [.tryRequire(moduleName)](#Resolver+tryRequire) ⇒ <code>Object</code> \| <code>null</code>

<a name="Loader+getModuleInfo"></a>

### loader.getModuleInfo(module, moduleName, [meta]) ⇒ [<code>ModuleInfo</code>](#ModuleInfo)
Loads a module with additional metadata

**Kind**: instance method of [<code>Loader</code>](#Loader)  
**Returns**: [<code>ModuleInfo</code>](#ModuleInfo) - module  

| Param | Type | Description |
| --- | --- | --- |
| module | <code>String</code> | Module content |
| moduleName | <code>String</code> | Name of module to load |
| [meta] | <code>Object</code> | Additional meta data |

<a name="Loader+loadModule"></a>

### loader.loadModule(moduleName, [meta]) ⇒ [<code>ModuleInfo</code>](#ModuleInfo)
Loads a module with additional metadata

**Kind**: instance method of [<code>Loader</code>](#Loader)  
**Returns**: [<code>ModuleInfo</code>](#ModuleInfo) - module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>String</code> | Name of module to load |
| [meta] | <code>Object</code> | Additional meta data |

<a name="Loader+loadPlugin"></a>

### loader.loadPlugin(module, [meta]) ⇒ [<code>PluginInfo</code>](#PluginInfo)
Loads a plugin with additional metadata.

**Kind**: instance method of [<code>Loader</code>](#Loader)  
**Returns**: [<code>PluginInfo</code>](#PluginInfo) - module  

| Param | Type | Description |
| --- | --- | --- |
| module | [<code>PluginName</code>](#PluginName) \| <code>Object</code> | Name of module to load (or module content) |
| [meta] | <code>Object</code> | Additional meta data |

<a name="Loader+loadPreset"></a>

### loader.loadPreset(module, [meta], [options]) ⇒ [<code>PresetInfo</code>](#PresetInfo)
Loads a preset with additional metadata

**Kind**: instance method of [<code>Loader</code>](#Loader)  
**Returns**: [<code>PresetInfo</code>](#PresetInfo) - module  

| Param | Type | Description |
| --- | --- | --- |
| module | [<code>PresetName</code>](#PresetName) | Name of module to load |
| [meta] | <code>Object</code> | Additional meta data |
| [options] | <code>Boolean</code> | Loading options |
| [options.shallow] | <code>Boolean</code> | Do not recursively load dependencies |

<a name="Loader+loadConfigured"></a>

### loader.loadConfigured(config) ⇒ <code>Object</code>
Loads presets and plugins as configured.
Plugins will be filtered and ordered as configuration with priority of:
 - added plugins > preset plugins > nested preset plugins

**Kind**: instance method of [<code>Loader</code>](#Loader)  
**Returns**: <code>Object</code> - results  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Presets and plugins to load |
| config.presets | [<code>Array.&lt;PresetName&gt;</code>](#PresetName) | Presets to load and add plugins from |
| config.add | [<code>Array.&lt;PluginName&gt;</code>](#PluginName) \| <code>Array.&lt;module&gt;</code> | Names of plugins to load |
| config.remove | <code>Array.&lt;string&gt;</code> | Names of plugins to remove (from presets) |

<a name="Resolver+resolve"></a>

### loader.resolve(moduleName) ⇒ <code>String</code>
Returns the resolved module filename

**Kind**: instance method of [<code>Loader</code>](#Loader)  
**Overrides**: [<code>resolve</code>](#Resolver+resolve)  
**Returns**: <code>String</code> - filename of the module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>String</code> | name of the module |

<a name="Resolver+require"></a>

### loader.require(moduleName) ⇒ <code>Object</code>
Returns the required module

**Kind**: instance method of [<code>Loader</code>](#Loader)  
**Overrides**: [<code>require</code>](#Resolver+require)  
**Returns**: <code>Object</code> - module contents  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>String</code> | name of the module |

<a name="Resolver+tryResolve"></a>

### loader.tryResolve(moduleName) ⇒ <code>String</code> \| <code>null</code>
Returns the resolved module filename, or null if not found

**Kind**: instance method of [<code>Loader</code>](#Loader)  
**Overrides**: [<code>tryResolve</code>](#Resolver+tryResolve)  
**Returns**: <code>String</code> \| <code>null</code> - filename of the module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>String</code> | name of the module |

<a name="Resolver+tryRequire"></a>

### loader.tryRequire(moduleName) ⇒ <code>Object</code> \| <code>null</code>
Returns the required module, or null if not found

**Kind**: instance method of [<code>Loader</code>](#Loader)  
**Overrides**: [<code>tryRequire</code>](#Resolver+tryRequire)  
**Returns**: <code>Object</code> \| <code>null</code> - module contents  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>String</code> | name of the module |

<a name="PackageIdentifier"></a>

## PackageIdentifier : [<code>PackageIdentifier</code>](#PackageIdentifier)
Utility class for working with package names and versions

**Kind**: global class  

* [PackageIdentifier](#PackageIdentifier) : [<code>PackageIdentifier</code>](#PackageIdentifier)
    * [.rawName](#PackageIdentifier+rawName) ⇒ <code>string</code>
    * [.fullName](#PackageIdentifier+fullName) ⇒ <code>string</code>
    * [.longName](#PackageIdentifier+longName) ⇒ <code>string</code>
    * [.shortName](#PackageIdentifier+shortName) ⇒ <code>string</code>
    * [.name](#PackageIdentifier+name) ⇒ <code>string</code>
    * [.version](#PackageIdentifier+version) ⇒ <code>string</code>
    * [.full](#PackageIdentifier+full) ⇒ <code>string</code>
    * [.withVersion([defaultVersion])](#PackageIdentifier+withVersion) ⇒ [<code>PackageIdentifier</code>](#PackageIdentifier)
    * [.nextFormat()](#PackageIdentifier+nextFormat) ⇒ [<code>PackageIdentifier</code>](#PackageIdentifier) \| <code>null</code>

<a name="PackageIdentifier+rawName"></a>

### packageIdentifier.rawName ⇒ <code>string</code>
Get the package name as provided to the identifier

**Kind**: instance property of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>string</code> - rawName  
<a name="PackageIdentifier+fullName"></a>

### packageIdentifier.fullName ⇒ <code>string</code>
Get the long package name

Examples:
- @gasket/plugin-https@1.2.3 -> @gasket/plugin-https
- @gasket/https -> @gasket/plugin-https
- @user/https -> @user/gasket-plugin-https
- https -> gasket-plugin-https

**Kind**: instance property of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>string</code> - fullName  
<a name="PackageIdentifier+longName"></a>

### packageIdentifier.longName ⇒ <code>string</code>
Alias to this.fullName

**Kind**: instance property of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>string</code> - fullName  
<a name="PackageIdentifier+shortName"></a>

### packageIdentifier.shortName ⇒ <code>string</code>
Get the short package name

Examples:
- @gasket/plugin-https -> @gasket/https
- @user/gasket-plugin-https -> @user/https
- gasket-plugin-https@1.2.3 -> https

**Kind**: instance property of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>string</code> - fullName  
<a name="PackageIdentifier+name"></a>

### packageIdentifier.name ⇒ <code>string</code>
Get only the package name

Examples:
- @gasket/plugin-https@1.2.3 -> @gasket/plugin-https
- https@1.2.3 -> https

**Kind**: instance property of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>string</code> - fullName  
<a name="PackageIdentifier+version"></a>

### packageIdentifier.version ⇒ <code>string</code>
Get only the package version

Examples:
- @gasket/plugin-https@1.2.3 -> 1.2.3
- @gasket/plugin-https -> ''

**Kind**: instance property of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>string</code> - fullName  
<a name="PackageIdentifier+full"></a>

### packageIdentifier.full ⇒ <code>string</code>
Get the full package name with version

Examples:
- @gasket/plugin-https@1.2.3 -> @gasket/plugin-https@1.2.3
- https@1.2.3 -> @gasket/plugin-https@1.2.3

**Kind**: instance property of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>string</code> - fullName  
<a name="PackageIdentifier+withVersion"></a>

### packageIdentifier.withVersion([defaultVersion]) ⇒ [<code>PackageIdentifier</code>](#PackageIdentifier)
Returns new PackageIdentifier with version added to desc if missing

Examples:
- @gasket/plugin-https@1.2.3 -> @gasket/plugin-https@1.2.3
- @gasket/plugin-https -> @gasket/plugin-https@latest

**Kind**: instance method of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: [<code>PackageIdentifier</code>](#PackageIdentifier) - identifier  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [defaultVersion] | <code>string</code> | <code>&quot;latest&quot;</code> | the version name to add if missing |

<a name="PackageIdentifier+nextFormat"></a>

### packageIdentifier.nextFormat() ⇒ [<code>PackageIdentifier</code>](#PackageIdentifier) \| <code>null</code>
If the rawName is a short name, get a new identifier, cycling through
formats which can be used to attempt to resolve packages by different
name pattern.

Examples:
- example -> gasket-plugin-example > example-gasket-plugin > @gasket/plugin-example > @gasket/example-plugin
- @gasket/example -> @gasket/plugin-example > @gasket/example-plugin
- @user/example -> @user/gasket-plugin-example > @user/example-gasket-plugin

**Kind**: instance method of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: [<code>PackageIdentifier</code>](#PackageIdentifier) \| <code>null</code> - identifier  
<a name="Resolver"></a>

## Resolver : [<code>Resolver</code>](#Resolver)
Utility to help resolve and require modules

**Kind**: global class  

* [Resolver](#Resolver) : [<code>Resolver</code>](#Resolver)
    * [new Resolver(options)](#new_Resolver_new)
    * [.resolve(moduleName)](#Resolver+resolve) ⇒ <code>String</code>
    * [.require(moduleName)](#Resolver+require) ⇒ <code>Object</code>
    * [.tryResolve(moduleName)](#Resolver+tryResolve) ⇒ <code>String</code> \| <code>null</code>
    * [.tryRequire(moduleName)](#Resolver+tryRequire) ⇒ <code>Object</code> \| <code>null</code>

<a name="new_Resolver_new"></a>

### new Resolver(options)

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Options |
| [options.resolveFrom] | <code>String</code> \| <code>Array.&lt;String&gt;</code> | Path(s) to resolve modules from |
| [options.require] | <code>require</code> | Require instance to use |

<a name="Resolver+resolve"></a>

### resolver.resolve(moduleName) ⇒ <code>String</code>
Returns the resolved module filename

**Kind**: instance method of [<code>Resolver</code>](#Resolver)  
**Returns**: <code>String</code> - filename of the module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>String</code> | name of the module |

<a name="Resolver+require"></a>

### resolver.require(moduleName) ⇒ <code>Object</code>
Returns the required module

**Kind**: instance method of [<code>Resolver</code>](#Resolver)  
**Returns**: <code>Object</code> - module contents  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>String</code> | name of the module |

<a name="Resolver+tryResolve"></a>

### resolver.tryResolve(moduleName) ⇒ <code>String</code> \| <code>null</code>
Returns the resolved module filename, or null if not found

**Kind**: instance method of [<code>Resolver</code>](#Resolver)  
**Returns**: <code>String</code> \| <code>null</code> - filename of the module  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>String</code> | name of the module |

<a name="Resolver+tryRequire"></a>

### resolver.tryRequire(moduleName) ⇒ <code>Object</code> \| <code>null</code>
Returns the required module, or null if not found

**Kind**: instance method of [<code>Resolver</code>](#Resolver)  
**Returns**: <code>Object</code> \| <code>null</code> - module contents  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>String</code> | name of the module |

<a name="pluginIdentifier"></a>

## pluginIdentifier() : [<code>createPackageIdentifier</code>](#createPackageIdentifier)
Create package identifiers for Gasket plugins

**Kind**: global function  
<a name="presetIdentifier"></a>

## presetIdentifier() : [<code>createPackageIdentifier</code>](#createPackageIdentifier)
Create package identifiers for Gasket presets

**Kind**: global function  
<a name="PluginDesc"></a>

## PluginDesc : <code>String</code>
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
<a name="PresetDesc"></a>

## PresetDesc : <code>String</code>
The package name with or without version of a preset.

For example:
  - @gasket/preset-nextjs        - fullName
  - @gasket/nextjs               - shortName
  - @gasket/preset-nextjs@^1.2.3 - full with version
  - @gasket/nextjs@^1.2.3        - short with version
  - gasket-preset-nextjs         - user fullName
  - nextjs                       - user shortName

**Kind**: global typedef  
<a name="PluginName"></a>

## PluginName : <code>String</code>
The package name only of a plugin.

For example:
  - @gasket/plugin-https        - fullName
  - @gasket/https               - shortName
  - gasket-plugin-https         - user fullName
  - https                       - user shortName

**Kind**: global typedef  
<a name="PresetName"></a>

## PresetName : <code>String</code>
The package name only of a preset.

For example:
  - @gasket/preset-nextjs        - fullName
  - @gasket/nextjs               - shortName
  - gasket-preset-nextjs         - user fullName
  - nextjs                       - user shortName

**Kind**: global typedef  
<a name="ModuleInfo"></a>

## ModuleInfo : <code>Object</code>
Module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of preset |
| module | <code>String</code> | Actual module content |
| [package] | <code>String</code> | Package.json contents |
| [version] | <code>String</code> | Resolved version |
| [path] | <code>String</code> | Path to the root of package |
| [from] | <code>String</code> | Name of module which requires this module |
| [range] | <code>String</code> | Range by which this module was required |

<a name="PluginInfo"></a>

## PluginInfo : [<code>ModuleInfo</code>](#ModuleInfo)
Plugin module with meta data

**Kind**: global typedef  
<a name="PresetInfo"></a>

## PresetInfo : [<code>ModuleInfo</code>](#ModuleInfo)
Preset module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| presets | [<code>Array.&lt;PresetInfo&gt;</code>](#PresetInfo) | Presets that this preset extends |
| plugins | [<code>Array.&lt;PluginInfo&gt;</code>](#PluginInfo) | Plugins this preset uses |

<a name="createPackageIdentifier"></a>

## createPackageIdentifier ⇒ [<code>PackageIdentifier</code>](#PackageIdentifier)
Create a new PackageIdentifier instance

**Kind**: global typedef  
**Returns**: [<code>PackageIdentifier</code>](#PackageIdentifier) - instance  

| Param | Type | Description |
| --- | --- | --- |
| rawName | <code>String</code> | Original input name of a package |
| [options] | <code>Object</code> | Options |
| [options.prefixed] | <code>boolean</code> | Set this to force prefixed/postfixed format for short names |


* [createPackageIdentifier](#createPackageIdentifier) ⇒ [<code>PackageIdentifier</code>](#PackageIdentifier)
    * [.isValidFullName(maybeFullName)](#createPackageIdentifier.isValidFullName) ⇒ <code>boolean</code>
    * [.lookup(name, handler)](#createPackageIdentifier.lookup) ⇒ [<code>PackageIdentifier</code>](#PackageIdentifier) \| <code>null</code>

<a name="createPackageIdentifier.isValidFullName"></a>

### createPackageIdentifier.isValidFullName(maybeFullName) ⇒ <code>boolean</code>
Static util method to check if a full name is valid

Examples:
- @gasket/plugin-https -> true
- @gasket/plugin-https@1.2.3 -> false
- https -> false

**Kind**: static method of [<code>createPackageIdentifier</code>](#createPackageIdentifier)  
**Returns**: <code>boolean</code> - fullName  

| Param | Type | Description |
| --- | --- | --- |
| maybeFullName | <code>string</code> | Name to check |

<a name="createPackageIdentifier.lookup"></a>

### createPackageIdentifier.lookup(name, handler) ⇒ [<code>PackageIdentifier</code>](#PackageIdentifier) \| <code>null</code>
Static util method to loop through format options for short names.
The handler will be provide the next formatted identifier to try,
which should return falsy to continue,
or return truthy to end and return the current identifier.
If the lookup runs out of formats to try, it will return null.

**Kind**: static method of [<code>createPackageIdentifier</code>](#createPackageIdentifier)  
**Returns**: [<code>PackageIdentifier</code>](#PackageIdentifier) \| <code>null</code> - identifier if found or null  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name to check |
| handler | <code>function</code> | Attempt to find package current format |

