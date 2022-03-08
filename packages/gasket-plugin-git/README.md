# @gasket/plugin-git

This a built-in plugin to the Gasket CLI used to set up new apps with git
repositories when using the [gasket create command].

## Usage

The features of this plugin hooks are in the lifecycles it hooks during the
create process.

### prompt

The `prompt` will ask users during the create command if they wish to initialize
a git repo or not. This prompt will set the `gitInit` property of the create
context. It is possible to default this in a preset, by setting this in the
preset's package.json, under a `gasket.create` property.

In the following example, when a new app is created with this preset, a git repo
will always be initialized, and the user not prompted.

```json
{
  "name": "gasket-preset-example",
  "version": "1.2.3",
  "main": "index.js",
  "dependencies": {
    "@gasket/resolve": "^2.0.0",
    "gasket-plugin-example": "^1.0.0"
  },
  "gasket": {
    "create" : {
      "gitInit": true
    }
  }
}
```

### create

During the `create` lifecycle, .gitignore and .gitattributes templates will be
registered to be generated for the app.

### postCreate

After all the app contents are generated, this plugin's postCreate hook will
make a first commit for the generated files. The timing for this hook is set to
run _last_. It is important when creating plugins that implement `postCreate`
hooks, that their timings do come _after_ the Git plugin, especially if
modifying files, otherwise those modifications will not be part of the first
commit.

See [plugin hook timings] for more information.

### Dynamically Generate `.gitignore`

In the `prompt` lifecycle, when the `gitInit` context property is set, this plugin will instantiate a new [Gitignore] instance and add it to the context.

```js
context.gitignore
```

This context property is responsible for adding and maintaining the files and directories that will be added to the `.gitignore` file.

#### `context.gitignore`

To add a file/directory, pass in the file/directory name as a string, or an array of strings, if you wish to add multiple.

```js
// example.js

context.gitignore.add('file-to-be-ignored.js');
context.gitignore.add(['file1.js', 'dir2/']);
```

```properties
# -- .gitignore file --

file-to-be-ignored.js
file1.js
dir2/
```

Files/directories can also be added to the `.gitignore` under a specific category. To do this, pass a second parameter to the `add` method.

```js
// example.js

context.gitignore.add('node_modules', 'dependencies');
```

```properties
# -- .gitignore file --

# dependencies
node_modules
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[gasket create command]:/packages/gasket-cli/README.md#create-command
[plugin hook timings]:/packages/gasket-engine/README.md
[Gitignore]: ./lib/gitignore.js
