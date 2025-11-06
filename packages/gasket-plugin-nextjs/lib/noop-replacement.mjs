/* eslint-disable no-undefined */
/* DO NOT EDIT OR DELETE THIS FILE */
// Empty module for replacing create.js and webpack-config.js files
// These files are build-time only and use Node APIs that don't work in Edge runtime
// Export a no-op function so imports still work but don't execute any Node API code
function noopHook(...args) {
  return args.length > 1 ? args[1] : undefined;
}
export default noopHook;
export { noopHook as webpackConfig };
