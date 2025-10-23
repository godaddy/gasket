import {
  txGasketPackageLinks,
  txGasketUrlLinks,
  txAbsoluteLinks
} from './utils/transforms.js';

/**
 * Specify what files to copy and transform
 * @type {import('@gasket/core').HookHandler<'docsSetup'>}
 */
export default function docsSetup() {
  return {
    link: 'README.md',
    files: [
      'README.md',
      'docs/**/*',
      'LICENSE.md'
    ],
    transforms: [
      txGasketPackageLinks,
      txGasketUrlLinks,
      txAbsoluteLinks
    ]
  };
}
