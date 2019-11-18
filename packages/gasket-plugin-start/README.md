# @gasket/plugin-start

Enables commands essential to building and running Gasket projects.

## Commands

### build command

Executes the `build` lifecycle. Use this to prepare your app for running, such
as bundling files, minifying code, processing assets, etc.

### start command

Executes the `preboot` and `start` lifecycles. Upon building your app, use this
command to run it.

### local command

Executes the `build`, `preboot` and `start` lifecycles. This command defaults
the environment to `local`, and is intended for local app development, only.

Plugins can hook the `start` lifecycle, inspect the command id, and adjust
startup behavior based on if the **start** or **local** commands was used. This
is useful, for example, to enabling hot reload or disabling service worker
caching during development.

This simple example hooks the start lifecycle to start up a web server, and
changes the port if using the local command.

```js
// example-server-plugin.js
const http = require('http');

module.exports = {
  name: 'example-server',
  hooks: {
    async start(gasket) {
      // set things unique for the local command
      const isLocal = gasket.command.id === 'local';

      const port = isLocal ? 3000 : 8000;
      const message = isLocal ? 'Hello.' : 'Hello World!';
      
      http.createServer(function (req, res) {
        res.write(message);
        res.end();
      }).listen(port);
    }
  }
}
```

## Lifecycles

### build

Plugins should hook this lifecycle to prepare files for the app to be run.

### start

This lifecycle can be used to run an app, such as by starting up a port
listener. Generally, the start lifecycle should only be hooked by one plugin
in an app.

### preboot

This lifecycle can be hooked by plugins to prepare an app before startup. This
should be used for in-memory setup, with an on disk prep handled during the
build lifecycle.
