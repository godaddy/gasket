## Typedefs

<dl>
<dt><a href="#DocsSetup">DocsSetup</a> : <code>Object</code></dt>
<dd><p>Setup object to describe docs configuration for a module</p>
</dd>
<dt><a href="#DocsConfig">DocsConfig</a> : <code>Object</code></dt>
<dd><p>Base docs configuration</p>
</dd>
<dt><a href="#ModuleDocsConfig">ModuleDocsConfig</a> : <code><a href="#DocsConfig">DocsConfig</a></code></dt>
<dd><p>Docs configuration for a module</p>
</dd>
<dt><a href="#DetailDocsConfig">DetailDocsConfig</a> : <code><a href="#DocsConfig">DocsConfig</a></code></dt>
<dd><p>Docs configuration for members of a plugin</p>
</dd>
<dt><a href="#LifecycleDocsConfig">LifecycleDocsConfig</a> : <code><a href="#DetailDocsConfig">DetailDocsConfig</a></code></dt>
<dd><p>Docs configuration with specifics for plugin lifecycles</p>
</dd>
<dt><a href="#DocsConfigSet">DocsConfigSet</a> : <code>Object</code></dt>
<dd><p>Set of docs configurations for the app</p>
</dd>
<dt><a href="#DocsTransform">DocsTransform</a> : <code>Object</code></dt>
<dd><p>Transform content of doc files matching test pattern</p>
</dd>
<dt><a href="#DocsTransformHandler">DocsTransformHandler</a> ⇒ <code>string</code></dt>
<dd><p>Handler to modify file contents for a DocsTransform</p>
</dd>
</dl>

<a name="DocsSetup"></a>

## DocsSetup : <code>Object</code>
Setup object to describe docs configuration for a module

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| link | <code>string</code> | Markdown link relative to package root |
| [files] | <code>Array.&lt;glob&gt;</code> | Names and/or patterns of files to collect |
| [transforms] | [<code>Array.&lt;DocsTransform&gt;</code>](#DocsTransform) | Transforms to apply to collected files |

<a name="DocsConfig"></a>

## DocsConfig : <code>Object</code>
Base docs configuration

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the the module or element |
| [description] | <code>string</code> | Description of the module or element |
| [link] | <code>string</code> | Relative path to a doc from the module's package |
| sourceRoot | <code>string</code> | Absolute path to the module's package |
| targetRoot | <code>string</code> | Absolute path to output dir for the module |

<a name="ModuleDocsConfig"></a>

## ModuleDocsConfig : [<code>DocsConfig</code>](#DocsConfig)
Docs configuration for a module

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| files | <code>Array.&lt;String&gt;</code> | Resolved files from docsSetup |
| transforms | [<code>Array.&lt;DocsTransform&gt;</code>](#DocsTransform) | Local doc transforms |
| metadata | <code>ModuleData</code> | Originating metadata for this module |

<a name="DetailDocsConfig"></a>

## DetailDocsConfig : [<code>DocsConfig</code>](#DocsConfig)
Docs configuration for members of a plugin

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | Name from the parent ModuleDocsConfig |

<a name="LifecycleDocsConfig"></a>

## LifecycleDocsConfig : [<code>DetailDocsConfig</code>](#DetailDocsConfig)
Docs configuration with specifics for plugin lifecycles

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | Executing method from the plugin-engine |
| [parent] | <code>string</code> | Lifecycle from which this one is invoked |
| [command] | <code>string</code> | Command from which this lifecycle is invoked |

<a name="DocsConfigSet"></a>

## DocsConfigSet : <code>Object</code>
Set of docs configurations for the app

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| app | [<code>ModuleDocsConfig</code>](#ModuleDocsConfig) | Docs from the main package |
| plugins | [<code>Array.&lt;ModuleDocsConfig&gt;</code>](#ModuleDocsConfig) | Docs for all configured plugins |
| presets | [<code>Array.&lt;ModuleDocsConfig&gt;</code>](#ModuleDocsConfig) | Docs for all configured presets |
| modules | [<code>Array.&lt;ModuleDocsConfig&gt;</code>](#ModuleDocsConfig) | Docs of supporting modules |
| structures | [<code>Array.&lt;DetailDocsConfig&gt;</code>](#DetailDocsConfig) | Docs describing structure elements |
| commands | [<code>Array.&lt;DetailDocsConfig&gt;</code>](#DetailDocsConfig) | Docs for available commands |
| lifecycles | [<code>Array.&lt;LifecycleDocsConfig&gt;</code>](#LifecycleDocsConfig) | Docs for available lifecycles |
| transforms | [<code>Array.&lt;DocsTransform&gt;</code>](#DocsTransform) | Global doc transforms |
| root | <code>string</code> | Absolute path to main package |
| docsRoot | <code>string</code> | Absolute path to output directory |

<a name="DocsTransform"></a>

## DocsTransform : <code>Object</code>
Transform content of doc files matching test pattern

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [global] | <code>Boolean</code> | If true, will be applied to all files, otherwise to only files in module. |
| test | <code>RegExp</code> | Expression to test against the full source filename |
| handler | [<code>DocsTransformHandler</code>](#DocsTransformHandler) | Function to modify matching files' contents |

<a name="DocsTransformHandler"></a>

## DocsTransformHandler ⇒ <code>string</code>
Handler to modify file contents for a DocsTransform

**Kind**: global typedef  
**Returns**: <code>string</code> - transformed content  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>String</code> | Doc file content to transform |
| data | <code>Object</code> | Additional details relating to the doc file being handled |
| data.filename | <code>String</code> | Relative path of this filename |
| data.docsConfig | [<code>ModuleDocsConfig</code>](#ModuleDocsConfig) | Docs config for this file's module |
| data.docsConfigSet | [<code>DocsConfigSet</code>](#DocsConfigSet) | Set of configs for the app |

