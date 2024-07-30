import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '../gasket.js';
export default withGasketData(gasket)(Document.default || Document);
