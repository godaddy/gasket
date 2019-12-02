# @gasket/assets

Gasket related visual assets

## Installation

```
npm i @gasket/assets
```

## Usage

Original SVGs are available, however the primary use case will to be import the
ready-to-use components for your app. Currently these are available for React.

### React

Import a logo or other asset directly and use as you would any other React
component. You can use `className` or `style` props to adjust size, position,
etc.

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

Add any new SVG files to the ./svg directory then run `npm run generate` to
output the importable components.

## License

[MIT](./LICENSE.md)
