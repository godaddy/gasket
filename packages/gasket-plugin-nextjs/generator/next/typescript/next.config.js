import 'tsx'

const gasket = (await import('./gasket.ts')).default;
export default gasket.actions.getNextConfig();
