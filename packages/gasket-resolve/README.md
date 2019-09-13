# @gasket/resolve

Essential module resolution and configuration management for gasket plugins and
presets.

## API Reference

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
<dt><a href="#pluginIdentifier">pluginIdentifier(name)</a> ⇒ <code><a href="#PackageIdentifier">PackageIdentifier</a></code></dt>
<dd><p>Package identifier for work with plugin name</p>
</dd>
<dt><a href="#presetIdentifier">presetIdentifier(name)</a> ⇒ <code><a href="#PackageIdentifier">PackageIdentifier</a></code></dt>
<dd><p>Package identifier for work with preset name</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ModuleInfo">ModuleInfo</a> : <code>Object</code></dt>
<dd><p>Module with meta data</p>
</dd>
<dt><a href="#PluginInfo">PluginInfo</a> : <code><a href="#ModuleInfo">ModuleInfo</a></code></dt>
<dd><p>Plugin module with meta data</p>
</dd>
<dt><a href="#PresetInfo">PresetInfo</a> : <code><a href="#ModuleInfo">ModuleInfo</a></code></dt>
<dd><p>Preset module with meta data</p>
</dd>
<dt><a href="#PluginDesc">PluginDesc</a> : <code>String</code></dt>
<dd><p>The package name with or without version of a plugin.</p>
<p>For example:</p>
<ul>
<li>@gasket/jest-plugin        - fullName</li>
<li>jest                       - shortName</li>
<li>@gasket/jest-plugin@^1.2.3 - full with version</li>
<li>jest@^1.2.3                - short with version</li>
</ul>
<p>Not intended for use with non-plugin package descriptions.
For example, the following patterns will not work:</p>
<ul>
<li>@gasket/jest</li>
</ul>
</dd>
<dt><a href="#PresetDesc">PresetDesc</a> : <code>String</code></dt>
<dd><p>The package name with or without version of a preset.</p>
<p>For example:</p>
<ul>
<li>@gasket/nextjs-preset        - fullName</li>
<li>nextjs                       - shortName</li>
<li>@gasket/nextjs-preset@^1.2.3 - full with version</li>
<li>nextjs@^1.2.3                - short with version</li>
</ul>
</dd>
<dt><a href="#PluginName">PluginName</a> : <code>String</code></dt>
<dd><p>The package name only of a plugin.</p>
<p>For example:</p>
<ul>
<li>@gasket/jest-plugin        - fullName</li>
<li>jest                       - shortName</li>
</ul>
</dd>
<dt><a href="#PresetName">PresetName</a> : <code>String</code></dt>
<dd><p>The package name only of a preset.</p>
<p>For example:</p>
<ul>
<li>@gasket/nextjs-preset        - fullName</li>
<li>nextjs                       - shortName</li>
</ul>
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
    * [new PackageIdentifier(rawName, suffix)](#new_PackageIdentifier_new)
    * [.fullName](#PackageIdentifier+fullName) ⇒ <code>string</code>
    * [.shortName](#PackageIdentifier+shortName) ⇒ <code>string</code>
    * [.name](#PackageIdentifier+name) ⇒ <code>string</code>
    * [.version](#PackageIdentifier+version) ⇒ <code>string</code>
    * [.full](#PackageIdentifier+full) ⇒ <code>string</code>
    * [.withVersion([defaultVersion])](#PackageIdentifier+withVersion) ⇒ [<code>PackageIdentifier</code>](#PackageIdentifier)
    * [.toString()](#PackageIdentifier+toString) ⇒ <code>String</code>

<a name="new_PackageIdentifier_new"></a>

### new PackageIdentifier(rawName, suffix)
Create a new package identifier instance


| Param | Type | Description |
| --- | --- | --- |
| rawName | <code>String</code> | Original input name of a package |
| suffix | <code>String</code> | suffix for special package names (-preset, or -plugin) |

<a name="PackageIdentifier+fullName"></a>

### packageIdentifier.fullName ⇒ <code>string</code>
Get the full package name

Examples:
- @gasket/https-plugin@1.2.3 -> @gasket/https-plugin
- https -> @gasket/https-plugin

**Kind**: instance property of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>string</code> - fullName  
<a name="PackageIdentifier+shortName"></a>

### packageIdentifier.shortName ⇒ <code>string</code>
Get the short package name

Examples:
- @gasket/https-plugin -> https
- https@1.2.3 -> https

**Kind**: instance property of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>string</code> - fullName  
<a name="PackageIdentifier+name"></a>

### packageIdentifier.name ⇒ <code>string</code>
Get only the package name

Examples:
- @gasket/https-plugin@1.2.3 -> @gasket/https-plugin
- https@1.2.3 -> https

**Kind**: instance property of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>string</code> - fullName  
<a name="PackageIdentifier+version"></a>

### packageIdentifier.version ⇒ <code>string</code>
Get only the package version

Examples:
- @gasket/https-plugin@1.2.3 -> 1.2.3
- @gasket/https-plugin -> ''

**Kind**: instance property of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>string</code> - fullName  
<a name="PackageIdentifier+full"></a>

### packageIdentifier.full ⇒ <code>string</code>
Get the full package name with version

Examples:
- @gasket/https-plugin@1.2.3 -> @gasket/https-plugin@1.2.3
- https@1.2.3 -> @gasket/https-plugin@1.2.3

**Kind**: instance property of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>string</code> - fullName  
<a name="PackageIdentifier+withVersion"></a>

### packageIdentifier.withVersion([defaultVersion]) ⇒ [<code>PackageIdentifier</code>](#PackageIdentifier)
Returns new PackageIdentifier with version added to desc if missing

Examples:
- @gasket/https-plugin@1.2.3 -> @gasket/https-plugin@1.2.3
- @gasket/https-plugin -> @gasket/https-plugin@latest

**Kind**: instance method of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: [<code>PackageIdentifier</code>](#PackageIdentifier) - identifier  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [defaultVersion] | <code>string</code> | <code>&quot;latest&quot;</code> | the version name to add if missing |

<a name="PackageIdentifier+toString"></a>

### packageIdentifier.toString() ⇒ <code>String</code>
Output the original raw name for string concatenation.

**Kind**: instance method of [<code>PackageIdentifier</code>](#PackageIdentifier)  
**Returns**: <code>String</code> - string  
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

## pluginIdentifier(name) ⇒ [<code>PackageIdentifier</code>](#PackageIdentifier)
Package identifier for work with plugin name

**Kind**: global function  
**Returns**: [<code>PackageIdentifier</code>](#PackageIdentifier) - identifier  

| Param | Type | Description |
| --- | --- | --- |
| name | [<code>PluginDesc</code>](#PluginDesc) | Name of the plugin package |

<a name="pluginIdentifier.isValidFullName"></a>

### pluginIdentifier.isValidFullName(maybeFullName) ⇒ <code>boolean</code>
Util method to check if a full name is valid

Examples:
- @gasket/https-plugin -> true
- @gasket/https-plugin@1.2.3 -> false
- https -> false

**Kind**: static method of [<code>pluginIdentifier</code>](#pluginIdentifier)  
**Returns**: <code>boolean</code> - fullName  

| Param | Type | Description |
| --- | --- | --- |
| maybeFullName | <code>string</code> | Name to check |

<a name="presetIdentifier"></a>

## presetIdentifier(name) ⇒ [<code>PackageIdentifier</code>](#PackageIdentifier)
Package identifier for work with preset name

**Kind**: global function  
**Returns**: [<code>PackageIdentifier</code>](#PackageIdentifier) - identifier  

| Param | Type | Description |
| --- | --- | --- |
| name | [<code>PresetDesc</code>](#PresetDesc) | Name of the preset package |

<a name="presetIdentifier.isValidFullName"></a>

### presetIdentifier.isValidFullName(maybeFullName) ⇒ <code>boolean</code>
Util method to check if a full name is valid

Examples:
- @gasket/nextjs-preset -> true
- @gasket/nextjs-preset@1.2.3 -> false
- nextjs -> false

**Kind**: static method of [<code>presetIdentifier</code>](#presetIdentifier)  
**Returns**: <code>boolean</code> - fullName  

| Param | Type | Description |
| --- | --- | --- |
| maybeFullName | <code>string</code> | Name to check |

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

<a name="PluginDesc"></a>

## PluginDesc : <code>String</code>
The package name with or without version of a plugin.

For example:
  - @gasket/jest-plugin        - fullName
  - jest                       - shortName
  - @gasket/jest-plugin@^1.2.3 - full with version
  - jest@^1.2.3                - short with version

Not intended for use with non-plugin package descriptions.
For example, the following patterns will not work:
  - @gasket/jest

**Kind**: global typedef  
<a name="PresetDesc"></a>

## PresetDesc : <code>String</code>
The package name with or without version of a preset.

For example:
  - @gasket/nextjs-preset        - fullName
  - nextjs                       - shortName
  - @gasket/nextjs-preset@^1.2.3 - full with version
  - nextjs@^1.2.3                - short with version

**Kind**: global typedef  
<a name="PluginName"></a>

## PluginName : <code>String</code>
The package name only of a plugin.

For example:
  - @gasket/jest-plugin        - fullName
  - jest                       - shortName

**Kind**: global typedef  
<a name="PresetName"></a>

## PresetName : <code>String</code>
The package name only of a preset.

For example:
  - @gasket/nextjs-preset        - fullName
  - nextjs                       - shortName

**Kind**: global typedef  
