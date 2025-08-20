# @gasket/assets Examples

This document provides comprehensive examples for all components and assets exported by `@gasket/assets`.

## React Components

### GasketLogo Component

```jsx
import React from 'react';
import GasketLogo from '@gasket/assets/react/gasket-logo';

const MyComponent = () => (
  <div>
    <GasketLogo />
  </div>
);
```

### GasketEmblem Component

```jsx
import React from 'react';
import GasketEmblem from '@gasket/assets/react/gasket-emblem';

const MyComponent = () => (
  <div>
    <GasketEmblem />
  </div>
);
```

### Logo and Emblem Together

```jsx
import React from 'react';
import { logo as GasketLogo, emblem as GasketEmblem } from '@gasket/assets';

const Header = () => (
  <header style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <GasketEmblem width={40} height={40} />
    <GasketLogo style={{ height: '32px' }} />
  </header>
);
```
