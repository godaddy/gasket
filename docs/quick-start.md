# Quick Start

## Create

To get started, you will need to install the `gasket` command.

```bash
npm i -g @gasket/cli
```

Now you can create gasket apps with the `gasket create` command and the preset
you would like to use. In this example we will create a Next.js app.

```bash
gasket create your-app-name --presets @gasket/preset-nextjs
```

This will create a new directory with the name of your app.

```bash
cd ./your-app-name
```

## Start

From here, you can start your app in local development mode:

```bash
npx gasket local
```

Otherwise you can build and start your app directly:

```bash
npx gasket build
npx gasket start --env local
```

You can use `gasket help` to see what other commands are available in your app.

For new apps, it is recommended to add additional plugins during `gasket create`
which may not be in the preset. For example, if you want the `gasket docs`
command in the app, you could specify the additional plugins as:

```bash
gasket create your-app-name --presets @gasket/nextjs --plugins @gasket/docs,@gasket/docsify
```

Notice also, that you can use [short-hand names] for presets and plugins here.

## Config

If you have an existing app, some plugins can be added after create.
First, install the necessary node modules:

```bash
npm i @gasket/plugin-docs @gasket/plugin-docsify
```

Then, in the app's `gasket.config.js`, add the plugins:

```diff
module.exports = {
  plugins: {
    presets: [
      '@gasket/nextjs',
+    ],
+    add: [
+      '@gasket/docs',
+      '@gasket/docsify'
    ]
  }
};
```

Now, when you run the docs command, a site will open in your default browser
with docs fore what is configured in your app.

```bash
npx gasket docs
```

<!-- LINKS -->

[short-hand names]:/packages/gasket-resolve/README.md#naming-convention
