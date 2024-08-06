import { PropsWithChildren, ReactElement } from 'react';
import type { Gasket, MaybeAsync } from '@gasket/core';

type LayoutOptions = {
  index: number;
}

type Layout = (props: PropsWithChildren<any>) => MaybeAsync<ReactElement>;

export function withGasketData(
  gasket: Gasket,
  options: LayoutOptions
): (layout: Layout) => (props: PropsWithChildren<any>) => Promise<ReactElement>
