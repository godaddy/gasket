# Next.js Deployment Guide

## Understand the `.next` folder

The `.next` folder is generated when your application is built. Which is
either done using the `npm run build` command, or when you run the server
in development mode e.g. `npm run local`. The `.next` folder contains
the following:

- `BUILD_ID` The build id that was generated for the application.
- `build-manifest.json` File that contains a mapping for all assets.
- `bundles` Folder that contains all build files for **client** usage.
- `static` Static files that are generated through WebPack.
- `server` Folder that contains all files that are used on the server.
  - `bundles` All build files, but for **server** usage.
  - `pages-manifest.json` Identical to `build-manifest.json` but for server.
  - `static` Static files to be used on the server.

All these files are needed to render your application server side or client
side.

## Consistent buildId

Next.js is configured to use a unique UUID V4 for each build. This can lead to
issues if you compile or build your application during deployment as you will
generate different `buildId`'s for each server.

Fortunately, Next.js allows you to specify a function that generates the
`buildId`. As we are building an application, that already has a `package.json`
file, you can default to the version of your application as `buildId`:

```js
{
  nextConfig: {
    generateBuildId: async () => {
      return require('./package.json').version;

      //
      // You can also use the latest commit of your project. Either
      // manually set it or use a module that parses it out of the
      // git command:
      //
      // return require('git-shizzle')('.').revParse('HEAD').trim();
      //
    }
  }
}
```

## To CDN or not to CDN

By default all the files that are in the `.next` folder will be hosted on your
application server. As most of these contain static files, it might make sense
for you application to upload it to the CDN.

If you decide to upload these to the CDN you need to instruct the application
to reference the files from the CDN instead of the application server. This is
done by setting the `assetPrefix` to the host/path of the CDN server.

You want to make sure that you only set the `assetPrefix` for production
environments so that when you are developing your application all assets are
still hosted on the application server. You can do this by setting environment
specific configuration in your `gasket.config.js`:

```js
{
  environments: {
    production: {
      nextConfig: {
        assetPrefix: 'https://<your cdn base url>/<directory that contains .next folder>'
      }
    }
  }
}
```

## Install production only dependencies

When you are deploying your application to production, make sure you only
install the `--production` dependencies to speed up the installation:

```bash
npm install --production
```

## Build for production

For production builds, you want to ensure that you end up with the smallest
bundle possible, so we need to set the `NODE_ENV=production` flag to instruct
the libraries to only include the code that is needed for production:

```bash
NODE_ENV=production npm run build
```

## The `gasket.config.js` contains environment specific configuration

There are values in the configuration that you might want to adjust when you
deploy to production, for example the hostname of your application, the
port number you deploy on, or even HTTPS options if that is not terminated
at a load balancer level.

Update your `gasket.config.js` file to include an `environments` object with
configuration values for the environments you deploy on:

```js
{
  environments: {
    production: {
      hostname: '<appname>.your-url.com',
      port: 8080,

      //
      // Rest of your production configuration here.
      //
    }
  }
}
```

See the [configuration][config] guide for more detailed information.

## What files should be included in your production deployment

Ensure that the following files are included when you deploy your application:

- `.next` (folder) *This contains the output of the WebPack builds*
- `locales` (folder) *Intl information*
- `plugins` (folder) *Plugins that you've written for Gasket*
- `lifecycles` (folder) *Lifecycle function to interact with Gasket*
- `config` (folder) *Environment specific configuration*
- `static` (folder) *Static files that need to be hosted*
- `node_modules` (folder)
- `package.json` *Scripts and dependencies for your project*
- `package-lock.json` *Automatically generated file about the installed dependencies*
- `.babelrc` *Config file for babel*
- `gasket.config.js` *Config file for Gasket*
- `routes.js` *Routes for your application*
- `store.js` *Scripts for creating a redux store and/or attaching a reducer*

## Deployment checklist

- [ ] `npm run analyze` is ran and the application dependency tree is optimized
- [ ] `npm test` is passing
- [ ] `npm run lint` does not contain any warnings
- [ ] `npm audit` does not contain any issues about top level dependencies
- [ ] All dependencies that are used are correctly licensed.
- [ ] `NODE_ENV=production npm run build` is ran
- [ ] SSL certificates are setup and correctly configured in `gasket.config`
- [ ] `gasket.config.js` contains `environment.production` with prod settings
- [ ] Bumped the version in `package.json`, following the semver standard

## Sample `Dockerfile`

You can also define a container for a `gasket` app to run with a `Dockerfile`.
Follow the [Docker deployment guide] to see a sample `Dockerfile`.

[config]: /packages/gasket-cli/docs/configuration.md
[Docker deployment guide]: docker-deployment.md
