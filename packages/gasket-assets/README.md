# @gasket/assets

A collection of Gasket-related visual assets.

## Installation

```sh
npm install @gasket/assets
```

## Usage

While you can access the original SVGs, the primary use case is to import the
ready-to-use components for your app, currently available for React.

### React

Import a logo or other asset directly and use it like any other React component.
You can adjust size, position, and more using `className` or `style` props.

```jsx
// demo-page.js

import React from 'react';
import GasketLogo from '@gasket/assets/react/gasket-logo';

const DemoPage = () => {
  <p>
    <GasketLogo style={{ width: '100px' }} />
  </p>
}
```

## Development

To add new SVG files, place them in the `./svg` directory, and then run `npm run
generate` to generate the importable components.

## License

[MIT License](./LICENSE.md)
