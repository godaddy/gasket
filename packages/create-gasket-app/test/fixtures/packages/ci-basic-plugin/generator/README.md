# {{{appName}}}

{{{appDescription}}}

## Local Setup

To support https for local development, first update your hosts file 
to include:

```
127.0.0.1  local.gasket.dev
```

Now start up the app.

```bash
cd {{{appName}}}

{{{installCmd}}}

{{{localCmd}}}
```

The app should now be accessible over https on port 8443 at:

```
https://local.gasket.dev:8443
```
