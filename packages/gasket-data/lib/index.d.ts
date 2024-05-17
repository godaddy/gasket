import type { GasketDataIntl } from '@gasket/plugin-intl';

declare module '@gasket/data' {
    export interface GasketData {
        config?: { [key: string | number]: string | undefined };
        intl?: GasketDataIntl;
    }

    const gasketData: GasketData;
    export default gasketData;
}
