# Quick Start

## Create

To get started, you will need to install the `gasket` command.

```bash
npm i -g create-gasket-app
```

Now you can create gasket apps with the `create-gasket-app` command and the preset
you would like to use. In this example we will create a Next.js app.

```bash
create-gasket-app --presets @gasket/preset-nextjs
```

This will create a new directory with the name of your app.

```bash
cd ./your-app-name
```

## Start

From here, you can start your app in local development mode:

```bash
npm run local
```

Otherwise you can build and start your app directly:

```bash
npm run build
npm run start --env local
```

## Config

If you have an existing app, some plugins can be added after create.
First, install the necessary node modules:

```bash
npm i @gasket/plugin-docs @gasket/plugin-docusaurus
```

Then, in the app's `gasket.js`, add the plugins:

```diff
import { makeGasket } from '@gasket/core';
+import pluginDocs from '@gasket/plugin-docs';
+import pluginDocusaurus from '@gasket/plugin-docusaurus';

export default makeGasket({
  plugins: [
    // other plugins
+    pluginDocs,
+    pluginDocusaurus
  ]
});
```

Now, when you run the docs command, a site will open in your default browser
with docs for what is configured in your app. See the [@gasket/plugin-command] documentation for more information about Gasket commands.

```bash
node gasket.js docs
```

<!-- LINKS -->


[@gasket/plugin-command]: ./packages/gasket-plugin-command/README.md
