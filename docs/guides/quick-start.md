# Quick Start

To get started, you will need to install the `gasket` command.

``` bash
npm i -g @gasket/cli
```

Now you can create gasket apps with the `gasket create` command.

``` bash
gasket create your-app-name
```

This will create a new directory with the name of your app.

``` bash
cd ./your-app-name
```

From here, you can install dependencies and run your starter app in development mode:

``` bash
npm install
npx gasket local
```

To support https for local development, first update your hosts file to include:

```bash
127.0.0.1  local.gasket.dev
```

The app should now be accessible over https on default port 8443:

```bash
https://local.gasket.dev:8443
```

Now you should be all set to start writing your code and see updates live in
the browser.

