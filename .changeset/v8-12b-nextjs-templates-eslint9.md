---
"@gasket/template-nextjs-app": patch
"@gasket/template-nextjs-express": patch
"@gasket/template-nextjs-pages": patch
---

Move generated Next.js apps to ESLint 9 flat config (`eslint.config.js`, `eslint-config-godaddy-react` 10, `eslint-config-next` 16); drop the legacy `eslintConfig`/`eslintIgnore` fields and the `eslint-plugin-react-hooks` override.
