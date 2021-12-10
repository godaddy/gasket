import type { marked } from 'marked';

declare module '@gasket/engine' {
  export interface GasketConfig {
    docsify?: {
      theme?: string,
      port?: number,
      stylesheets?: Array<string>,
      scripts?: Array<string>,
      config?: {
        el?: string,
        repo?: string,
        maxLevel?: number,
        loadNavbar?: boolean | string,
        loadSidebar?: boolean | string,
        hideSidebar?: boolean,
        subMaxLevel?: number,
        auto2top?: boolean,
        homepage?: string,
        basePath?: string,
        relativePath?: boolean,
        coverpage?: boolean | string | Array<string[]> | Record<string, string>,
        logo?: string,
        name?: string,
        nameLink?: string,
        markdown?: marked.MarkedOptions,
        themeColor?: string,
        alias?: Record<string, string>,
        autoHeader?: boolean,
        executeScript?: boolean,
        noEmoji?: boolean,
        mergeNavbar?: boolean,
        formatUpdated?: string | ((time: Date) => string),
        externalLinkTarget?: string,
        cornerExternalLinkTarget?: string,
        externalLinkRel?: string,
        routerMode?: 'history' | 'hash',
        crossOriginLinks?: Array<string>,
        noCompileLinks?: Array<string>,
        onlyCover?: boolean,
        requestHeaders?: Record<string, string>,
        ext?: string,
        fallbackLanguages?: Array<string>,
        notFoundPage?: boolean | string | Record<string, string>,
        topMargin?: number,
        vueComponents?: Record<string, any>,
        vueGlobalOptions?: any,
        vueMounts?: Record<string, any>,
      }
    }
  }
}