# @gasket/template-vite

Gasket template for creating applications with Vite, React, and Express.

## Features

- ⚡️ **Vite** - Lightning-fast HMR and build tool
- ⚛️ **React 18** - Modern React with TypeScript
- 🚀 **Gasket** - Server-side framework with plugin architecture
- 📦 **Express** - Web server
- 🧪 **Vitest** - Fast unit testing
- 📝 **TypeScript** - Type-safe development

## Usage

Create a new Gasket app with this template:

```bash
gasket create my-app --template=@gasket/template-vite
```

Or with `create-gasket-app`:

```bash
npx create-gasket-app my-app --template=@gasket/template-vite
```

## Template Structure

```
template/
├── src/
│   ├── App.tsx              # Main React component
│   ├── main.tsx             # React entry point
│   ├── components/
│   │   └── Head.tsx         # Head component for meta tags
│   └── test/
│       └── App.test.tsx     # Component tests
├── gasket.ts                # Gasket configuration
├── server.ts                # Server entry point
├── vite.config.ts           # Vite configuration
├── index.html               # HTML template
├── tsconfig.json            # TypeScript config (client)
├── tsconfig.node.json       # TypeScript config (server)
└── vitest.config.ts         # Test configuration
```

## What's Included

### Gasket Plugins

- `@gasket/plugin-express` - Express server integration
- `@gasket/plugin-https` - HTTPS server support
- `@gasket/plugin-logger` - Logging utilities
- `@gasket/plugin-vite` - Vite integration

### Scripts

- `npm run local` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Lint code

## Learn More

- [Gasket Documentation](https://gasket.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)

## License

MIT

