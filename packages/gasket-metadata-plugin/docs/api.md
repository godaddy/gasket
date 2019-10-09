## Typedefs

<dl>
<dt><a href="#ModuleData">ModuleData</a> : <code>Object</code></dt>
<dd><p>Module with meta data</p>
</dd>
<dt><a href="#AppData">AppData</a> : <code><a href="#ModuleData">ModuleData</a></code></dt>
<dd><p>App module with meta data</p>
</dd>
<dt><a href="#PluginData">PluginData</a> : <code><a href="#ModuleData">ModuleData</a></code></dt>
<dd><p>Plugin module with meta data</p>
</dd>
<dt><a href="#PresetData">PresetData</a> : <code><a href="#ModuleData">ModuleData</a></code></dt>
<dd><p>Preset module with meta data</p>
</dd>
<dt><a href="#DetailData">DetailData</a> : <code>Object</code></dt>
<dd><p>Metadata for details of a plugin</p>
</dd>
<dt><a href="#LifecycleData">LifecycleData</a> : <code><a href="#DetailData">DetailData</a></code></dt>
<dd><p>Metadata with specifics details for plugin lifecycles</p>
</dd>
<dt><a href="#Metadata">Metadata</a> : <code>Object</code></dt>
<dd><p>Collection data for modules configured for app</p>
</dd>
</dl>

<a name="ModuleData"></a>

## ModuleData : <code>Object</code>
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
| [link] | <code>string</code> | Path to a doc file or URL |

<a name="AppData"></a>

## AppData : [<code>ModuleData</code>](#ModuleData)
App module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [modules] | [<code>Array.&lt;DetailData&gt;</code>](#DetailData) | Description of modules supporting this plugin |

<a name="PluginData"></a>

## PluginData : [<code>ModuleData</code>](#ModuleData)
Plugin module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [commands] | [<code>Array.&lt;DetailData&gt;</code>](#DetailData) | Commands enabled by this plugin |
| [structures] | [<code>Array.&lt;DetailData&gt;</code>](#DetailData) | App files and directories used by plugin |
| [lifecycles] | [<code>Array.&lt;DetailData&gt;</code>](#DetailData) | Description of lifecycles invoked by plugin |
| [modules] | [<code>Array.&lt;DetailData&gt;</code>](#DetailData) | Description of modules supporting this plugin |

<a name="PresetData"></a>

## PresetData : [<code>ModuleData</code>](#ModuleData)
Preset module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| presets | [<code>Array.&lt;PresetData&gt;</code>](#PresetData) | Presets that this preset extends |
| plugins | [<code>Array.&lt;PluginData&gt;</code>](#PluginData) | Plugins this preset uses |

<a name="DetailData"></a>

## DetailData : <code>Object</code>
Metadata for details of a plugin

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the the module or element |
| [description] | <code>string</code> | Description of the module or element |
| [link] | <code>string</code> | Path to a doc file or URL |

<a name="LifecycleData"></a>

## LifecycleData : [<code>DetailData</code>](#DetailData)
Metadata with specifics details for plugin lifecycles

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | Executing method from the plugin-engine |
| [parent] | <code>string</code> | Lifecycle from which this one is invoked |
| [command] | <code>string</code> | Command from which this lifecycle is invoked |

<a name="Metadata"></a>

## Metadata : <code>Object</code>
Collection data for modules configured for app

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| app | [<code>Array.&lt;AppData&gt;</code>](#AppData) | App and main package data |
| presets | [<code>Array.&lt;PresetData&gt;</code>](#PresetData) | Preset data with dependency hierarchy |
| plugins | [<code>Array.&lt;PluginData&gt;</code>](#PluginData) | Flat list of registered plugin data |
| modules | [<code>Array.&lt;ModuleData&gt;</code>](#ModuleData) | Supporting module data |

