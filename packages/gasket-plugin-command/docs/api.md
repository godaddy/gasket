
## GasketCommand

The GasketCommand can be extended to allow plugins to introduce new CLI
commands to invoke Gasket lifecycles.

**Kind**: global class  

* [GasketCommand]
    * _instance_
        * [.gasket]
        * [.parsed]
        * *[.gasketRun()]*
        * [.gasketConfigure(gasketConfig)]
    * _static_
        * [.flags]


### gasketCommand.gasket

Gasket Plugin engine instance with details of session

**Kind**: instance property of [`GasketCommand`]  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| command | `object` | Details of command |
| command.id | `string` | Name of command |
| command.flags | `object` | Flags |
| command.argv | `Array.<string>` | Ordered Arguments |
| command.args | `object` | Named arguments |
| config | `object` | Loaded and modified configuration |
| config.env | `string` | Environment set by command flags |


### gasketCommand.parsed

Flags and arguments passed with CLI command.

**Kind**: instance property of [`GasketCommand`]  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| parsed.flags | `object` | Flags |
| parsed.argv | `Array.<string>` | Ordered Arguments |
| parsed.args | `object` | Named arguments |


### *gasketCommand.gasketRun()*

Abstract method which must be implemented by subclasses, used to execute
Gasket lifecycles, following the `init` and `configure` Gasket lifecycles.

**Kind**: instance abstract method of [`GasketCommand`]  

### gasketCommand.gasketConfigure(gasketConfig)

Virtual method which may be overridden by subclasses, to adjust the
Gasket Config.

**Kind**: instance method of [`GasketCommand`]  
**Returns**: `object` - gasketConfig  

| Param | Type | Description |
| --- | --- | --- |
| gasketConfig | `object` | Gasket configurations |


### GasketCommand.flags

These are required for all gasket commands, required by the CLI for loading
the appropriate gasket.config file and environment.

**Kind**: static property of [`GasketCommand`]  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | `string` | Fully qualified gasket config to load (default: `'gasket.config'`) |
| root | `string` | Top-level app directory (default: `process.cwd()`) |
| env | `string` | Target runtime environment (default: `GASKET_ENV` or `'development'`) |

<!-- LINKS -->

[GasketCommand]:#gasketcommand
[.gasket]:#gasketcommandgasket
[.parsed]:#gasketcommandparsed
[.flags]:#gasketcommandflags
[`GasketCommand`]:#gasketcommand
[.gasketRun()]:#gasketcommandgasketrun
[.gasketConfigure(gasketConfig)]:#gasketcommandgasketconfiguregasketconfig
