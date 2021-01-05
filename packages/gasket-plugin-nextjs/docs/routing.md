# Next.js Routing Guide

Next.js provides the ability to do universal routing, meaning that inbound HTTP
requests cause specific pages to be rendered and served up, and you can create
hyperlinks among pages where clicking on them allows you to transition among
pages without provoking a full page reload. We recommend familiarizing yourself
with the official [Next.js documentation], but we'll touch on core concepts here
as well.

## Automatic file system routing

The simplest way to define routes in your application is to simply export
components from files in a `pages/` directory in your application. The structure
of this directory and file names directly map to route names. For example, given
this structure:

```text
pages/
  blog/
    index.js
    1.js
    2.js
  about.js
  index.js
```

...the following route URLs are available for your site:

```text
/                       // maps to /pages/index.js
/about                  // maps to /pages/about.js
/blog                   // maps to /pages/blog/index.js
/blog/1                 // maps to /pages/blog/1.js
/blog/2                 // maps to /pages/blog/2.js
```

## Client-side transitions among pages

To create hyperlinks to pages that utilize client-side routing:

```jsx
import * as React from 'react';
import Link from 'next/link';

const MyComponent = () => (
  <Link href="/blog">
    <a>Blog</a>
  </Link>
);
```

Note that unlike most React routing frameworks, the `Link` component doesn't
render the hyperlink directly, but rather it modifies the `href` prop of its
child component.

You can also programmatically change routes with the Next.js router. Consult
the [Next.js routing] docs for more information.

## Parameterized pages

If you need the contents of the page to be dynamic based on the URL, you can read the query string or use [dynamic routes](https://nextjs.org/docs/routing/dynamic-routes). There are two ways to read the query string. At the page level, the context object passed to the static [getInitialProps] method contains a `query` object with the parsed query string parameters.

```jsx
import * as React from 'react';
import fetchArticle from './fetch-article';

export default class BlogPage extends React.Component {
  static async getInitialProps({ query }) {
    const contents = await fetchArticle(query.article);

    return {
      articleMarkdown: contents
    }
  }
  
  render() {
    const content = this.props.articleMarkdown;
    return <>{ content }</>
  }
};
```

If you need to access router details in a more nested context, you can connect
your component with the [Next.js router HOC]: `withRouter`.

<!-- LINKS -->

[getInitialProps]:https://github.com/zeit/next.js#fetching-data-and-component-lifecycle
[Next.js documentation]:https://github.com/zeit/next.js
[Next.js routing]:https://github.com/zeit/next.js#routing
[Next.js router HOC]:https://github.com/zeit/next.js#using-a-higher-order-component
