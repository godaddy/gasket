
## Classes

Name | Description
------ | -----------
[LocaleUtils] | 

## Typedefs

Name | Description
------ | -----------
[LocalePathPart] | Partial URL representing a directory containing locale .json files or a URL template with a `:locale` path param to a .json file.
[LocalePath] | URL path to a locale .json file
[Lang] | Language code only
[Locale] | Language code with region


## LocaleUtils

**Kind**: global class  

* [LocaleUtils]
    * [new LocaleUtils(config)]
    * [.getFallbackLocale(locale)]
    * [.formatLocalePath(localePathPart, locale)]
    * [.getLocalePath(localePathPart, locale)]
    * [.pathToUrl(localePath)]


### new LocaleUtils(config)

Utility class for loading locale files


| Param | Type | Description |
| --- | --- | --- |
| config | `Object` | Configuration |
| config.manifest | `LocaleManifest` | Locale file manifest |
| \[config.basePath\] | `string` | Locale file base path. Defaults to `manifest.basePath` |


### localeUtils.getFallbackLocale(locale)

Fallback to the lang part of a locale or to defaultLocale.

Here's an example using da-DK/da with en-US as defaultLocale
da-DK ==> da ==> en-US ==> en ==> null

**Kind**: instance method of [`LocaleUtils`]  
**Returns**: [`Locale`] ⎮ [`Lang`] ⎮ `null` - language - fallback language to use.  

| Param | Type | Description |
| --- | --- | --- |
| locale | [`Locale`] | Current locale |


### localeUtils.formatLocalePath(localePathPart, locale)

Format a localePath with provide locale

**Kind**: instance method of [`LocaleUtils`]  
**Returns**: [`LocalePath`] - localePath  

| Param | Type | Description |
| --- | --- | --- |
| localePathPart | [`LocalePathPart`] | Path containing locale files |
| locale | [`Locale`] | Locale |


### localeUtils.getLocalePath(localePathPart, locale)

Get a formatted localePath considering language mappings and fallbacks

**Kind**: instance method of [`LocaleUtils`]  
**Returns**: [`LocalePath`] - localePath  

| Param | Type | Description |
| --- | --- | --- |
| localePathPart | [`LocalePathPart`] | Path containing locale files |
| locale | [`Locale`] | Locale |


### localeUtils.pathToUrl(localePath)

Add base path from window.gasket.intl or manifest if set to the locale path

**Kind**: instance method of [`LocaleUtils`]  
**Returns**: `string` - url  

| Param | Type | Description |
| --- | --- | --- |
| localePath | [`LocalePath`] | URL path to a locale file |


## LocalePathPart

Partial URL representing a directory containing locale .json files
or a URL template with a `:locale` path param to a .json file.

**Kind**: global typedef  
**Example**  
```js
"/locales"
```
**Example**  
```js
"/locales/:locale/component.json"
```

## LocalePath

URL path to a locale .json file

**Kind**: global typedef  
**Example**  
```js
"/locales/en-US.json"
```
**Example**  
```js
"/locales/en-US/component.json"
```

## Lang

Language code only

**Kind**: global typedef  
**Example**  
```js
"en"
```

## Locale

Language code with region

**Kind**: global typedef  
**Example**  
```js
"en-US"
```
<!-- LINKS -->

[LocaleUtils]:#localeutils
[LocalePathPart]:#localepathpart
[LocalePath]:#localepath
[Lang]:#lang
[Locale]:#locale
[`LocaleUtils`]:#new-localeutilsconfig
[`Locale`]:#locale
[`Lang`]:#lang
[`LocalePath`]:#localepath
[`LocalePathPart`]:#localepathpart
[new LocaleUtils(config)]:#new-localeutilsconfig
[.getFallbackLocale(locale)]:#localeutilsgetfallbacklocalelocale
[.formatLocalePath(localePathPart, locale)]:#localeutilsformatlocalepathlocalepathpart-locale
[.getLocalePath(localePathPart, locale)]:#localeutilsgetlocalepathlocalepathpart-locale
[.pathToUrl(localePath)]:#localeutilspathtourllocalepath
