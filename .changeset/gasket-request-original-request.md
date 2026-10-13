---
"@gasket/request": minor
---

Add `getOriginalRequest`, which returns the framework request a `GasketRequest`
was normalized from, for reading fields this package does not normalize such as
`ip`. The original is stored under a registry-global symbol, non-enumerable, so
the serialized shape of `GasketRequest` is unchanged and duplicate installs of
the package resolve the same slot. Returns `undefined` when there is no original
request.

Also adds `GasketRequest.method`, the uppercased request method. It is
`undefined` when the source exposes none, including in the Next.js App Router,
and is deliberately not defaulted to `GET`.
