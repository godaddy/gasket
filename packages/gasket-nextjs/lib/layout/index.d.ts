import { PropsWithChildren, ReactElement } from 'react';
import type { Gasket } from '@gasket/core';

type LayoutOptions = {
  index: number;
}

export function withGasketDataLayout(
  gasket: Gasket,
  layout: (props: PropsWithChildren<any>) => ReactElement,
  options: LayoutOptions
): (props: PropsWithChildren<any>) => Promise<ReactElement>
