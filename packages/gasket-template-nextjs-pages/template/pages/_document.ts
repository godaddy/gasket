import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '@/gasket';
export default withGasketData(gasket)(Document);
