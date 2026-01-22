# @gasket/plugin-git

This is a built-in plugin for the Gasket CLI used to set up new apps with git
repositories when using the [gasket create command].

## Usage

The features of this plugin hooks are in the lifecycles it hooks during the
create process.

### prompt

The `prompt` will ask users during the create command if they wish to initialize
a GitHub repository. This prompt will set the `gitInit` property of the create
context.

### create

During the `create` lifecycle, .gitignore and .gitattributes templates will be
registered to be generated for the app.

If you have a plugin which needs to add git ignore rules, in the `create`
lifecycle hook of your plugin, you can access `gitignore` helper to add rules.
Rules can be added to different categories which will group them under comments.

The `gitignore` helper will only be placed on the CreateContext when this plugin
is configured and `gitInit` is true from the prompt.

#### Example adding gitignore

```js
export default {
  name: 'gasket-plugin-example',
  hooks: {
    create(gasket, createContext) {
      const { gitignore } = createContext;

      // See if `gitignore` is on the create context
      if(gitignore) {
        // ignore a single file
        gitignore.add('file-to-be-ignored.js');

        // ignore wildcard rules
        gitignore.add('*.tmp');

        // ignore multiple files and/or directories
        gitignore.add(['file1.js', 'dir2/']);

        // add an ignore under a category
        gitignore.add('node_modules', 'dependencies');
      }
    }
  }
};
```

The resulting `.gitignore` that is generated will have all the added gitignore
rules and comments for categories.

```properties
# -- .gitignore file --

file-to-be-ignored.js
*.tmp
file1.js
dir2/

# dependencies
node_modules
```

### postCreate

After all the app contents are generated, this plugin's postCreate hook will
make a first commit for the generated files. The timing for this hook is set to
run _last_. It is important when creating plugins that implement `postCreate`
hooks, that their timings do come _after_ the Git plugin, especially if
modifying files, otherwise those modifications will not be part of the first
commit.

See [plugin hook timings] for more information.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[gasket create command]:/packages/gasket-cli/README.md#create-command
[plugin hook timings]:/packages/gasket-engine/README.md
