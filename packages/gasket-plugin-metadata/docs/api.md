
## Typedefs

Name | Description
------ | -----------
[ModuleData] | Module with meta data
[AppData] | App module with meta data
[PluginData] | Plugin module with meta data
[PresetData] | Preset module with meta data
[DetailData] | Metadata for details of a plugin
[LifecycleData] | Metadata with specifics details for plugin lifecycles
[Metadata] | Collection data for modules configured for app


## ModuleData

Module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | `string` | Name of preset |
| module | `string` | Actual module content |
| \[package\] | `string` | Package.json contents |
| \[version\] | `string` | Resolved version |
| \[path\] | `string` | Path to the root of package |
| \[from\] | `string` | Name of module which requires this module |
| \[range\] | `string` | Range by which this module was required |
| \[link\] | `string` | Path to a doc file or URL |


## AppData

App module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| \[modules\] | `Array.<DetailData>` | Description of modules supporting this plugin |


## PluginData

Plugin module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| \[commands\] | `Array.<DetailData>` | Commands enabled by this plugin |
| \[structures\] | `Array.<DetailData>` | App files and directories used by plugin |
| \[lifecycles\] | `Array.<DetailData>` | Description of lifecycles invoked by plugin |
| \[modules\] | `Array.<DetailData>` | Description of modules supporting this plugin |


## PresetData

Preset module with meta data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| presets | `Array.<PresetData>` | Presets that this preset extends |
| plugins | `Array.<PluginData>` | Plugins this preset uses |


## DetailData

Metadata for details of a plugin

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | `string` | Name of the the module or element |
| \[description\] | `string` | Description of the module or element |
| \[link\] | `string` | Path to a doc file or URL |


## LifecycleData

Metadata with specifics details for plugin lifecycles

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| method | `string` | Executing method from the engine |
| \[parent\] | `string` | Lifecycle from which this one is invoked |
| \[command\] | `string` | Command from which this lifecycle is invoked |


## Metadata

Collection data for modules configured for app

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| app | `Array.<AppData>` | App and main package data |
| presets | `Array.<PresetData>` | Preset data with dependency hierarchy |
| plugins | `Array.<PluginData>` | Flat list of registered plugin data |
| modules | `Array.<ModuleData>` | Supporting module data |

<!-- LINKS -->

[ModuleData]:#moduledata
[AppData]:#appdata
[PluginData]:#plugindata
[PresetData]:#presetdata
[DetailData]:#detaildata
[LifecycleData]:#lifecycledata
[Metadata]:#metadata
