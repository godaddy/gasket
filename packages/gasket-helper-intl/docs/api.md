
## Classes

Name | Description
------ | -----------
[LocaleUtils] | Utility class for loading locale files

## Typedefs

Name | Description
------ | -----------
[LocalePathPart] | Partial URL representing a directory containing locale .json files or a URL template with a `:locale` path param to a .json file.
[LocalePath] | URL path to a locale .json file
[Lang] | Language code only
[Locale] | Language code with region
[LocalesState] | State of loaded locale files
[LocalesProps] | Props for a Next.js page containing locale and initial state
[LocaleStatus] | Fetch status of a locale file


## LocaleUtils

Utility class for loading locale files

**Kind**: global class  

* [LocaleUtils]
    * [new LocaleUtils(config)]
    * [.getFallbackLocale(locale)]
    * [.formatLocalePath(localePathPart, locale)]
    * [.getLocalePath(localePathPart, locale)]
    * [.pathToUrl(localePath)]
    * [.serverLoadData(localePathPart, locale, localesDir)]


### new LocaleUtils(config)


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

Format a localePath with provided locale. Ensures path starts with slash
and ends with .json file.

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


### localeUtils.serverLoadData(localePathPart, locale, localesDir)

Load locale file(s) and return localesProps.
Throws error if attempted to use in browser.

**Kind**: instance method of [`LocaleUtils`]  
**Returns**: [`LocalesProps`] - localesProps  

| Param | Type | Description |
| --- | --- | --- |
| localePathPart | [`LocalePathPart`] \| `Array.<LocalePathPart>` | Path(s) containing locale files |
| locale | [`Locale`] | Locale to load |
| localesDir | `string` | Disk path to locale files dir |


## LocaleStatus

Enum for local status values

**Kind**: global enum  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| LOADING | [`LocaleStatus`] | `loading` | 
| LOADED | [`LocaleStatus`] | `loaded` | 
| ERROR | [`LocaleStatus`] | `error` | 


* [LocaleStatus]
    * [.LOADING]
    * [.LOADED]
    * [.ERROR]


### LocaleStatus.LOADING

**Kind**: static property of [`LocaleStatus`]  
**Default**: `loading`  

### LocaleStatus.LOADED

**Kind**: static property of [`LocaleStatus`]  
**Default**: `loaded`  

### LocaleStatus.ERROR

**Kind**: static property of [`LocaleStatus`]  
**Default**: `error`  

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
// as a template
"/locales/:locale/component.json"
```
**Example**  
```js
// other param formats
"/locales/$locale/component.json"
"/locales/{locale}/component.json"
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
// from a template
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

## LocalesState

State of loaded locale files

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| messages | `Object` | 
| status | `Object` | 


## LocalesProps

Props for a Next.js page containing locale and initial state

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| locale | [`Locale`] | 


## LocaleStatus

Fetch status of a locale file

**Kind**: global typedef  
**Read only**: true  

* [LocaleStatus]
    * [.LOADING]
    * [.LOADED]
    * [.ERROR]


### LocaleStatus.LOADING

**Kind**: static property of [`LocaleStatus`]  
**Default**: `loading`  

### LocaleStatus.LOADED

**Kind**: static property of [`LocaleStatus`]  
**Default**: `loaded`  

### LocaleStatus.ERROR

**Kind**: static property of [`LocaleStatus`]  
**Default**: `error`  
<!-- LINKS -->

[LocaleUtils]:#localeutils
[LocalePathPart]:#localepathpart
[LocalePath]:#localepath
[Lang]:#lang
[Locale]:#locale
[LocalesState]:#localesstate
[LocalesProps]:#localesprops
[LocaleStatus]:#localestatus
[`LocaleUtils`]:#new-localeutilsconfig
[`Locale`]:#locale
[`Lang`]:#lang
[`LocalePath`]:#localepath
[`LocalePathPart`]:#localepathpart
[`LocalesProps`]:#localesprops
[`LocaleStatus`]:#localestatus
[.LOADING]:#localestatusloading
[.LOADED]:#localestatusloaded
[.ERROR]:#localestatuserror
[new LocaleUtils(config)]:#new-localeutilsconfig
[.getFallbackLocale(locale)]:#localeutilsgetfallbacklocalelocale
[.formatLocalePath(localePathPart, locale)]:#localeutilsformatlocalepathlocalepathpart-locale
[.getLocalePath(localePathPart, locale)]:#localeutilsgetlocalepathlocalepathpart-locale
[.pathToUrl(localePath)]:#localeutilspathtourllocalepath
[.serverLoadData(localePathPart, locale, localesDir)]:#localeutilsserverloaddatalocalepathpart-locale-localesdir
