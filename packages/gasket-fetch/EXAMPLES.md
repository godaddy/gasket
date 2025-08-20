# @gasket/fetch Examples

This document provides working examples for all exported functions and constructors from `@gasket/fetch`.

**NOTE**: For Node 18+ you can use the `fetch` function directly.

## Default Export: fetch

The main export is a fetch function that works in both browser and Node.js environments.

### Basic GET Request

```js
import fetch from '@gasket/fetch';

// Simple GET request
const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
const data = await response.json();
console.log(data); // { userId: 1, id: 1, title: "...", completed: false }
```

### Basic POST Request

```js
import fetch from '@gasket/fetch';

const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'foo',
    body: 'bar',
    userId: 1,
  }),
});

const data = await response.json();
console.log(data); // { title: 'foo', body: 'bar', userId: 1, id: 101 }
```
