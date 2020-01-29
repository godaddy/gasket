
## Classes

Name | Description
------ | -----------
[PackageManager] | Wrapper class for executing commands for a given package manager

## Functions

Name | Description
------ | -----------
[applyEnvironmentOverrides(gasketConfig, config, \[localFile\])] | Normalize the config by applying any environment or local overrides
[runShellCommand(cmd, argv, options, \[debug\])] | Promise friendly wrapper to running a shell command (eg: git, npm, ls)which passes back any { stdout, stderr } to the error thrown.
[tryRequire(path)] | Tries to require a module, but ignores if it is not found.If not found, result will be null.


## PackageManager

Wrapper class for executing commands for a given package manager

**Kind**: global class  

* [PackageManager]
    * [new PackageManager(options)]
    * _instance_
        * [.exec(cmd, args)]
        * [.link(packages)]
        * [.install(args)]
        * [.info(args)]
    * _static_
        * [.spawnNpm(argv, spawnWith)]
        * [.spawnYarn(argv, spawnWith)]


### new PackageManager(options)


| Param | Type | Description |
| --- | --- | --- |
| options | `object` | Options |
| \[options.packageManager\] | `string` | Name of manager, either `npm` (default) or `yarn` |
| options.dest | `string` | Target directory where `node_module` should exist |
| \[options.npmconfig\] | `string` | DEPRECATED Path to userconfig |


### packageManager.exec(cmd, args)

Executes npm in the application directory `this.dest`.
This installation can be run multiple times.

**Kind**: instance method of [`PackageManager`]  
**Returns**: `Promise` - promise  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| cmd | `string` | The command that needs to be executed. |
| args | `Array.<string>` | Additional CLI arguments to pass to `npm`. |


### packageManager.link(packages)

Executes npm link in the application directory `this.dest`.

**Kind**: instance method of [`PackageManager`]  
**Returns**: `Promise` - promise  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| packages | `Array.<string>` | Explicit `npm` packages to link locally. |


### packageManager.install(args)

Executes npm install in the application directory `this.dest`.
This installation can be run multiple times.

**Kind**: instance method of [`PackageManager`]  
**Returns**: `Promise` - promise  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| args | `Array.<string>` | Additional CLI arguments to pass to `npm`. |


### packageManager.info(args)

Executes yarn or npm info, and returns parsed JSON data results.

**Kind**: instance method of [`PackageManager`]  
**Returns**: `Promise.<object>` - stdout and data  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| args | `Array.<string>` | Additional CLI arguments to pass to `npm`. |


### PackageManager.spawnNpm(argv, spawnWith)

Executes the appropriate npm binary with the verbatim `argv` and
`spawnWith` options provided. Passes appropriate debug flag for
npm based on process.env.

**Kind**: static method of [`PackageManager`]  
**Returns**: `Promise` - promise  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| argv | `Array.<string>` | Precise CLI arguments to pass to `npm`. |
| spawnWith | `object` | Options for child_process.spawn. |


### PackageManager.spawnYarn(argv, spawnWith)

Executes the appropriate yarn binary with the verbatim `argv` and
`spawnWith` options provided. Passes appropriate debug flag for
npm based on process.env.

**Kind**: static method of [`PackageManager`]  
**Returns**: `Promise` - promise  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| argv | `Array.<string>` | Precise CLI arguments to pass to `npm`. |
| spawnWith | `object` | Options for child_process.spawn. |


## applyEnvironmentOverrides(gasketConfig, config, \[localFile\])

Normalize the config by applying any environment or local overrides

**Kind**: global function  
**Returns**: `object` - config  

| Param | Type | Description |
| --- | --- | --- |
| gasketConfig | `object` | Gasket config |
| config | `object` | Target config to be normalized |
| \[localFile\] | `string` | Optional file to load relative to gasket root |


## runShellCommand(cmd, argv, options, \[debug\])

Promise friendly wrapper to running a shell command (eg: git, npm, ls)
which passes back any { stdout, stderr } to the error thrown.

**Kind**: global function  
**Returns**: `Promise` - A promise represents if npm succeeds or fails.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| cmd | `string` | binary that is run |
| argv | `array` | args passed to npm binary through spawn. |
| options | `object` | options passed to npm binary through spawn |
| \[debug\] | `boolean` | When present pipes std{out,err} to process.* |

**Example**  
```js
const { runShellCommand } = require('@gasket/utils');

 async function helloWorld() {
  await runShellCommand('echo', ['hello world']);
}
```

## tryRequire(path)

Tries to require a module, but ignores if it is not found.
If not found, result will be null.

**Kind**: global function  
**Returns**: `object` - module  

| Param | Type | Description |
| --- | --- | --- |
| path | `string` | Module to import |

**Example**  
```js
const { tryRequire } = require('@gasket/utils');

 let someConfig = tryRequire('../might/be/a/path/to/some/file');

 if(!someConfig) {
  someConfig = require('./default-config')
}
```
<!-- LINKS -->

[PackageManager]:#packagemanager
[`PackageManager`]:#new-packagemanageroptions
[applyEnvironmentOverrides(gasketConfig, config, \[localFile\])]:#applyenvironmentoverridesgasketconfig-config-localfile
[runShellCommand(cmd, argv, options, \[debug\])]:#runshellcommandcmd-argv-options-debug
[tryRequire(path)]:#tryrequirepath
[new PackageManager(options)]:#new-packagemanageroptions
[.exec(cmd, args)]:#packagemanagerexeccmd-args
[.link(packages)]:#packagemanagerlinkpackages
[.install(args)]:#packagemanagerinstallargs
[.info(args)]:#packagemanagerinfoargs
[.spawnNpm(argv, spawnWith)]:#packagemanagerspawnnpmargv-spawnwith
[.spawnYarn(argv, spawnWith)]:#packagemanagerspawnyarnargv-spawnwith
