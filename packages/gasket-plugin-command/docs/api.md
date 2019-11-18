<a name="GasketCommand"></a>

## GasketCommand
The GasketCommand can be extended to allow plugins to introduce new CLI
commands to invoke Gasket lifecycles.

**Kind**: global class  

* [GasketCommand](#GasketCommand)
    * _instance_
        * [.gasket](#GasketCommand+gasket) : <code>Gasket</code>
        * [.parsed](#GasketCommand+parsed) : <code>ParserOutput</code>
        * *[.gasketRun()](#GasketCommand+gasketRun)*
        * [.gasketConfigure(gasketConfig)](#GasketCommand+gasketConfigure) ⇒ <code>Object</code>
    * _static_
        * [.flags](#GasketCommand.flags) : <code>Object</code>

<a name="GasketCommand+gasket"></a>

### gasketCommand.gasket : <code>Gasket</code>
Gasket Plugin engine instance with details of session

**Kind**: instance property of [<code>GasketCommand</code>](#GasketCommand)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| command | <code>Object</code> | Details of command |
| command.id | <code>String</code> | Name of command |
| command.flags | <code>Object</code> | Flags |
| command.argv | <code>Array</code> | Ordered Arguments |
| command.args | <code>Object</code> | Named arguments |
| config | <code>Object</code> | Loaded and modified configuration |
| config.env | <code>String</code> | Environment set by command flags |

<a name="GasketCommand+parsed"></a>

### gasketCommand.parsed : <code>ParserOutput</code>
Flags and arguments passed with CLI command.

**Kind**: instance property of [<code>GasketCommand</code>](#GasketCommand)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| parsed.flags | <code>Object</code> | Flags |
| parsed.argv | <code>Array</code> | Ordered Arguments |
| parsed.args | <code>Object</code> | Named arguments |

<a name="GasketCommand+gasketRun"></a>

### *gasketCommand.gasketRun()*
Abstract method which must be implemented by subclasses, used to execute
Gasket lifecycles, following the `init` and `configure` Gasket lifecycles.

**Kind**: instance abstract method of [<code>GasketCommand</code>](#GasketCommand)  
<a name="GasketCommand+gasketConfigure"></a>

### gasketCommand.gasketConfigure(gasketConfig) ⇒ <code>Object</code>
Virtual method which may be overridden by subclasses, to adjust the
Gasket Config before env overrides are applied.

**Kind**: instance method of [<code>GasketCommand</code>](#GasketCommand)  
**Returns**: <code>Object</code> - gasketConfig  

| Param | Type | Description |
| --- | --- | --- |
| gasketConfig | <code>Object</code> | Gasket configurations |

<a name="GasketCommand.flags"></a>

### GasketCommand.flags : <code>Object</code>
These are required for all gasket commands, required by the CLI for loading
the appropriate gasket.config file and environment.

**Kind**: static property of [<code>GasketCommand</code>](#GasketCommand)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>string</code> | Fully qualified gasket config to load (default: `'gasket.config'`) |
| root | <code>string</code> | Top-level app directory (default: `process.cwd()`) |
| env | <code>string</code> | Target runtime environment (default: `NODE_ENV` or `'development'`) |

