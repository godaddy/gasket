# `@gasket/docs-plugin`

The docs command is awesomeness

## Commands

### `docs`

Does the stuff

## Lifecycles

### `docs`

Add doc configuration per plugin.

### `docsView`

Allows plugins to render the docs for the user.

By default this plugin with render docs using docsify.
If you are implementing a different plugin with a docsView hook, you can
disable docsify in your plugins `configure` hook.

```js
module.exports = {
  hooks: {
    configure( gasket, config ) {
      return {
        ...config,
        docs: {
          ...docs,
          docsify: false
        }
      }
    },
    async docsView( gasket, docsConfig ) {
      // do something
    }
  }
}
```

## API Reference

## Typedefs

<dl>
<dt><a href="#DocsSetup">DocsSetup</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#DocsConfig">DocsConfig</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#ModuleDocsConfig">ModuleDocsConfig</a> : <code><a href="#DocsConfig">DocsConfig</a></code></dt>
<dd></dd>
<dt><a href="#SubDocsConfig">SubDocsConfig</a> : <code><a href="#DocsConfig">DocsConfig</a></code></dt>
<dd></dd>
<dt><a href="#LifecycleDocsConfig">LifecycleDocsConfig</a> : <code><a href="#SubDocsConfig">SubDocsConfig</a></code></dt>
<dd></dd>
<dt><a href="#DocsConfigSet">DocsConfigSet</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#DocsTransformHandler">DocsTransformHandler</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#DocsTransform">DocsTransform</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="DocsSetup"></a>

## DocsSetup : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| link | <code>string</code> | Markdown link relative to package root |
| [files] | <code>Array.&lt;glob&gt;</code> |  |
| [transforms] | [<code>Array.&lt;DocsTransform&gt;</code>](#DocsTransform) |  |

<a name="DocsConfig"></a>

## DocsConfig : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| name | <code>string</code> | 
| [description] | <code>string</code> | 
| [link] | <code>string</code> | 
| sourceRoot | <code>string</code> | 
| targetRoot | <code>string</code> | 

<a name="ModuleDocsConfig"></a>

## ModuleDocsConfig : [<code>DocsConfig</code>](#DocsConfig)
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| files | <code>Array.&lt;String&gt;</code> | 
| transforms | [<code>Array.&lt;DocsTransform&gt;</code>](#DocsTransform) | 
| metadata | <code>Metadata</code> | 

<a name="SubDocsConfig"></a>

## SubDocsConfig : [<code>DocsConfig</code>](#DocsConfig)
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| from | <code>string</code> | 

<a name="LifecycleDocsConfig"></a>

## LifecycleDocsConfig : [<code>SubDocsConfig</code>](#SubDocsConfig)
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| method | <code>string</code> | 
| [parent] | <code>string</code> | 
| [command] | <code>string</code> | 

<a name="DocsConfigSet"></a>

## DocsConfigSet : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| app | [<code>ModuleDocsConfig</code>](#ModuleDocsConfig) |  |
| plugins | [<code>Array.&lt;ModuleDocsConfig&gt;</code>](#ModuleDocsConfig) |  |
| presets | [<code>Array.&lt;ModuleDocsConfig&gt;</code>](#ModuleDocsConfig) |  |
| modules | [<code>Array.&lt;ModuleDocsConfig&gt;</code>](#ModuleDocsConfig) |  |
| structures | [<code>Array.&lt;SubDocsConfig&gt;</code>](#SubDocsConfig) |  |
| commands | [<code>Array.&lt;SubDocsConfig&gt;</code>](#SubDocsConfig) |  |
| lifecycles | [<code>Array.&lt;LifecycleDocsConfig&gt;</code>](#LifecycleDocsConfig) |  |
| transforms | [<code>Array.&lt;DocsTransform&gt;</code>](#DocsTransform) | Global docs transforms |
| root | <code>string</code> |  |
| docsRoot | <code>string</code> |  |

<a name="DocsTransformHandler"></a>

## DocsTransformHandler ⇒ <code>string</code>
**Kind**: global typedef  
**Returns**: <code>string</code> - transformed content  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>String</code> | Content |
| data | <code>Object</code> |  |
| data.filename | <code>String</code> | Relative package filename |
| data.docsConfig | [<code>ModuleDocsConfig</code>](#ModuleDocsConfig) | Docs config for this file's module |
| data.docsConfigSet | [<code>DocsConfigSet</code>](#DocsConfigSet) | - |

<a name="DocsTransform"></a>

## DocsTransform : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [global] | <code>Boolean</code> | If true, will be applied to all doc files |
| test | <code>RegExp</code> | Expression to test against the full source file path |
| handler | [<code>DocsTransformHandler</code>](#DocsTransformHandler) | Expression to test against the full source file path |

