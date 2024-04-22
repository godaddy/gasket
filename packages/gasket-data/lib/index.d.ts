declare module '@gasket/data' {
    export interface GasketData {
      config: { [key: string | number]: string | undefined };
    }

    const gasketData: GasketData;
    export default gasketData;
}
