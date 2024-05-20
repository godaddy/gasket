
## Classes

Name | Description
------ | -----------
[PackageManager] | Wrapper class for executing commands for a given package manager

## Functions

Name | Description
------ | -----------
[applyConfigOverrides(config, context)] | Normalize the config by applying any overrides for environments, commands, or local-only config file.
[runShellCommand(cmd, \[argv\], \[options\], \[debug\])] | Promise friendly wrapper to running a shell command (eg: git, npm, ls) which passes back any { stdout, stderr } to the error thrown.
[tryRequire(path)] | Tries to require a module, but ignores if it is not found. If not found, result will be null.
[tryResolve(modulePath, options)] | 


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


## applyConfigOverrides(config, context)

Normalize the config by applying any overrides for environments, commands,
or local-only config file.

**Kind**: global function  
**Returns**: `object` - config  

| Param | Type | Description |
| --- | --- | --- |
| config | `object` | Target config to be normalized |
| context | `object` | Context for applying overrides |
| context.env | `string` | Name of environment |
| \[context.commandId\] | `string` | Name of command |


## runShellCommand(cmd, \[argv\], \[options\], \[debug\])

Promise friendly wrapper to running a shell command (eg: git, npm, ls)
which passes back any { stdout, stderr } to the error thrown.

Options can be passed to the underlying spawn. An additional `signal` option
can be passed to use AbortController, allowing processes to be killed when
no longer needed.

**Kind**: global function  
**Returns**: `Promise` - A promise represents if command succeeds or fails.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| cmd | `string` | Binary that is run |
| \[argv\] | `Array.<string>` | Arguments passed to npm binary through spawn. |
| \[options\] | `object` | Options passed to npm binary through spawn |
| \[options.signal\] | `object` | AbortControl signal allowing process to be canceled |
| \[debug\] | `boolean` | When present pipes std{out,err} to process.* |

**Example**  
```js
const { runShellCommand } = require('@gasket/utils');

 async function helloWorld() {
  await runShellCommand('echo', ['hello world']);
}
```
**Example**  
```js
// With timeout using AbortController

const { runShellCommand } = require('@gasket/utils');
const AbortController = require('abort-controller');

 async function helloWorld() {
  const controller = new AbortController();
  // abort the process after 60 seconds
  const id = setTimeout(() => controller.abort(), 60000);
  await runShellCommand('long-process', ['something'], { signal: controller.signal });
  clearTimeout(id);
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

## tryResolve(modulePath, options)

**Kind**: global function  
**Returns**: `string` - module path  

| Param | Type | Description |
| --- | --- | --- |
| modulePath | `string` | Module to import |
| options | `object` | Paths to search for the module |

<!-- LINKS -->

[PackageManager]:#packagemanager
[`PackageManager`]:#new-packagemanageroptions
[applyConfigOverrides(config, context)]:#applyconfigoverridesconfig-context
[runShellCommand(cmd, \[argv\], \[options\], \[debug\])]:#runshellcommandcmd-argv-options-debug
[tryRequire(path)]:#tryrequirepath
[tryResolve(modulePath, options)]:#tryresolvemodulepath-options
[new PackageManager(options)]:#new-packagemanageroptions
[.exec(cmd, args)]:#packagemanagerexeccmd-args
[.link(packages)]:#packagemanagerlinkpackages
[.install(args)]:#packagemanagerinstallargs
[.info(args)]:#packagemanagerinfoargs
[.spawnNpm(argv, spawnWith)]:#packagemanagerspawnnpmargv-spawnwith
[.spawnYarn(argv, spawnWith)]:#packagemanagerspawnyarnargv-spawnwith
