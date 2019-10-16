# Quick Start

To get started, you will need to install the `gasket` command.

```bash
npm i -g @gasket/cli
```

Now you can create gasket apps with the `gasket create` command and the preset
you would like to use.

```bash
gasket create your-app-name --presets nextjs
```

This will create a new directory with the name of your app.

```bash
cd ./your-app-name
```

From here, you can start your app in local development mode:

```bash
npx gasket local
```

Otherwise you can build and start your app directly:

```bash
npx gasket build
npx gasket start --env local
```

