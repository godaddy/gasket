import appDescription from './app-description.js';
import appType from './app-type.js';
import docs from './docs.js';

export default async function runActions(context) {
  appDescription(context);
  docs(context);
  await appType(context);
}
