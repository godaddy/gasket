
## Typedefs

Name | Description
------ | -----------
[DocsSetup] | Setup object to describe docs configuration for a module
[DocsConfig] | Base docs configuration
[ModuleDocsConfig] | Docs configuration for a module
[DetailDocsConfig] | Docs configuration for members of a plugin
[LifecycleDocsConfig] | Docs configuration with specifics for plugin lifecycles
[DocsConfigSet] | Set of docs configurations for the app
[DocsTransform] | Transform content of doc files matching test pattern
[DocsTransformHandler] | Handler to modify file contents for a DocsTransform


## DocsSetup

Setup object to describe docs configuration for a module

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| link | `string` | Markdown link relative to package root |
| \[files\] | `Array.<glob>` | Names and/or patterns of files to collect |
| \[transforms\] | `Array.<DocsTransform>` | Transforms to apply to collected files |
| \[modules\] | `Object.<string, DocsSetup>` | Setup object for supporting modules |


## DocsConfig

Base docs configuration

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | `string` | Name of the module or element |
| \[description\] | `string` | Description of the module or element |
| \[link\] | `string` | Relative path to a doc from the module's package |
| sourceRoot | `string` | Absolute path to the module's package |
| targetRoot | `string` | Absolute path to output dir for the module |


## ModuleDocsConfig

Docs configuration for a module

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| files | `Array.<string>` | Resolved files from docsSetup |
| transforms | `Array.<DocsTransform>` | Local doc transforms |
| metadata | `ModuleData` | Originating metadata for this module |


## DetailDocsConfig

Docs configuration for members of a plugin

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| from | `string` | Name from the parent ModuleDocsConfig |


## LifecycleDocsConfig

Docs configuration with specifics for plugin lifecycles

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| method | `string` | Executing method from the engine |
| \[parent\] | `string` | Lifecycle from which this one is invoked |
| \[command\] | `string` | Command from which this lifecycle is invoked |


## DocsConfigSet

Set of docs configurations for the app

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| app | [`ModuleDocsConfig`] | Docs from the main package |
| plugins | `Array.<ModuleDocsConfig>` | Docs for all configured plugins |
| presets | `Array.<ModuleDocsConfig>` | Docs for all configured presets |
| modules | `Array.<ModuleDocsConfig>` | Docs of supporting modules |
| structures | `Array.<DetailDocsConfig>` | Docs describing structure elements |
| commands | `Array.<DetailDocsConfig>` | Docs for available commands |
| guides | `Array.<DetailDocsConfig>` | Docs for setups and explanations |
| lifecycles | `Array.<LifecycleDocsConfig>` | Docs for available lifecycles |
| transforms | `Array.<DocsTransform>` | Global doc transforms |
| root | `string` | Absolute path to main package |
| docsRoot | `string` | Absolute path to output directory |


## DocsTransform

Transform content of doc files matching test pattern

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| \[global\] | `boolean` | If true, will be applied to all files, otherwise to only files in module. |
| test | `RegExp` | Expression to test against the full source filename |
| handler | [`DocsTransformHandler`] | Function to modify matching files' contents |


## DocsTransformHandler

Handler to modify file contents for a DocsTransform

**Kind**: global typedef  
**Returns**: `string` - transformed content  

| Param | Type | Description |
| --- | --- | --- |
| content | `string` | Doc file content to transform |
| data | `object` | Additional details relating to the doc file being handled |
| data.filename | `string` | Relative path of this filename |
| data.docsConfig | [`ModuleDocsConfig`] | Docs config for this file's module |
| data.docsConfigSet | [`DocsConfigSet`] | Set of configs for the app |

<!-- LINKS -->

[DocsSetup]:#docssetup
[DocsConfig]:#docsconfig
[ModuleDocsConfig]:#moduledocsconfig
[DetailDocsConfig]:#detaildocsconfig
[LifecycleDocsConfig]:#lifecycledocsconfig
[DocsConfigSet]:#docsconfigset
[DocsTransform]:#docstransform
[DocsTransformHandler]:#docstransformhandler
[`ModuleDocsConfig`]:#moduledocsconfig
[`DocsTransformHandler`]:#docstransformhandler
[`DocsConfigSet`]:#docsconfigset
