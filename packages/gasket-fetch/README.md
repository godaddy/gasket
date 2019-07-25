# @gasket/fetch

Gasket will utilize the Fetch API as our standard request library.
This package serves as a proxy for fetch implementations with server-side
support.

## How to use it

With promises:

```js
import fetch from '@gasket/fetch';

fetch('url/to/resource')
  .then(res => {
    if (res.ok) {
      // handle success
    } else {
      // handle error
    }
  });
```

With async/await:

```js
import fetch from '@gasket/fetch';

const getSomething = async () => {
  const res = await fetch('url/to/resource');
  if (res.ok) {
    // handle success
  } else {
    // handle error
  }
};
```

### Reference

- https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- https://github.com/lquixada/cross-fetch
