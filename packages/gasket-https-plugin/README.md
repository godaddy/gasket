# `@gasket/https-plugin`

A plugin that creates `http` and `https` servers based on the given `gasket`
configuration.

## Table of Contents

- [`@gasket/https-plugin`](#gaskethttps-plugin)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Lifecycles](#lifecycles)
      - [createServers](#createservers)
      - [servers](#servers)
  - [Configuration](#configuration-1)
        - [LICENSE: MIT](#license-mit)

## Installation

```
npm install @gasket/https-plugin
```

## Configuration

Add it to the `plugins` section of your `gasket.config.js`:

```js
{
  "plugins": [
    "add": ["https"]
  ]
}
```

## Lifecycles

#### createServers

Executed in order to retrieve the server options and the handler

```js
/**
* In this example returns the express app
*
* @param {Gasket} gasket Gasket API.
* @param {Object} serverOpts Server options.
* @returns {Express} The web server.
* @public
*/
createServers: async function createServers(gasket, serverOpts) {
  const newServerOpts;
  return { ...serverOpts, ...newServerOpts, handler: express() };
}
```

#### servers

Your application can use this plugin to hook the `servers` hook. These servers
are consumed directly from [`create-servers`].

```js
/**
 *
 * @param  {Gasket} gasket The Gasket API
 * @param {Servers} manifest Waterfall manifest to adjust
 * @return {Promise<Object>} updated manifest
 */
module.exports = async function serversHook(gasket, servers) {
  const cert = servers.https.cert;

  console.log('Started https server with cert:');
  console.log(cert);
}
```

## Configuration

You can specify what port to open up on, or what certificates to use via
`gasket.config.js`.

```js
// gasket.config.js
{
  http: 80,
  https: {
    port: 443,
    root: '/path/to/ssl/files',
    key: 'your-key.pem',
    cert: 'your-cert.pem',
    ca: 'your-ca.pem', // Can be an Array of CAs
  }
};
```
##### LICENSE: [MIT](./LICENSE)

[`create-servers`]: https://github.com/indexzero/create-servers#http--https
