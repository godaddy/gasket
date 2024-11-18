# @gasket/request

## Installation

#### Existing apps

```shell
npm install @gasket/request
```

- Node's IncomingMessage [docs](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
- Express "enhances" this as Request [docs](https://expressjs.com/en/api.html#req)
- I didn't verify with Fastify, but let's assume they've dressed it up, also.
- Next.js API's (including middleware) use NextRequest [docs](https://nextjs.org/docs/pages/api-reference/functions/next-request)
- This extends the browser-compatible Fetch Request [docs](https://developer.mozilla.org/en-US/docs/Web/API/Request)
- Next.js App Router does not expose the request, so we make a representation with the parts available [docs](https://github.com/godaddy/gasket/blob/main/packages/gasket-nextjs/README.md#request)

- For static pages, we also assemble a request representation (code).

DELETE INTERNAL LINK -> https://github.com/gdcorp-uxp/gasket/blob/main/packages/gasket-next/src/document/with-static-req.js

