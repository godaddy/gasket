# @gasket/plugin-git

This a built-in plugin to the Gasket CLI used to set up new apps with git
repositories when using the [gasket create command].

## Hooks

This plugin hooks the following lifecycles:
- [prompt](#prompt)
- [create](#create)
- [postCreate](#postCreate)

### prompt

The `prompt` will ask users during the create command if they wish to
initialize a git repo or not. This prompt will set the `gitInit` property of
the create context. It is possible to default this in a preset, by setting this
in the preset's package.json, under a `gasket.create` property.

In the following example, when a new app is created with this preset, a git repo
will always be initialized, and the user not prompted.

```json
{
  "name": "my-preset",
  "version": "1.2.3",
  "main": "index.js",
  "dependencies": {
    "@gasket/resolve": "^1.0.0",
    "my-plugin": "^1.0.0"
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
make a first commit for the generated files. The timing for this hook is set
to run _last_. It is important when creating plugins that implement
`postCreate` hooks, that their timings do come _after_ the git-plugin,
especially if modifying files, otherwise those modifications will not be
part of the first commit.

See [plugin hook timings] for more information.


[gasket create command]:/packages/gasket-cli/README.md#gasket-create-appname
[plugin hook timings]:/packages/gasket-plugin-engine#hooks
