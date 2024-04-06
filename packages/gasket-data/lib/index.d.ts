declare module '@gasket/data' {
    export interface GasketData {
        [key: string]: any;
    }

    const gasketData: GasketData;
    export default gasketData;
}
