import { Document as NextDocument } from 'next';
import { GasketData } from '@gasket/data';

/**
 * Renders a script tag with JSON gasketData
 *
 * @param {object} props - Props
 * @param {object} props.data - Gasket data from response
 * @returns {JSX.Element} script
 */
export function GasketDataScript(props: { data: object }): JSX.Element;

/**
 * Make a wrapper to extend the Next.js Document, injecting a script with the
 * `gasketData` from the response object.
 *
 * @param {object} [options] - Configuration for wrapper
 * @param {number} [options.index] - Force script injection at particular index
 * @returns {function(NextDocument)} wrapper
 */
export function withGasketData(options?: { index?: number }): (component: NextDocument) => NextDocument;

/**
 * React hook that fetches GasketData in elements context and returns it
 *
 * @returns { GasketData } GasketData
 */
export function useGasketData(): GasketData;

/**
 * Provider for the GasketData, adds context to child elements.
 *
 * @param {GasketData} props - Props
 * @param {GasketData} props.gasketData - Object of GasketData
 * @param {JSX.Element} props.children - Element to add GasketData context too
 * @returns {function} wrapper
 */
export function GasketDataProvider(props: { gasketData: GasketData, children: JSX.Element }): Function;

/**
 * Make an HOC that adds a provider for the GasketData.
 * This can be used to wrap a top level React, Next.js custom App component or Next.js custom NextDocument component.
 *
 * @returns {function} wrapper
 */
export function withGasketDataProvider(): Function;
