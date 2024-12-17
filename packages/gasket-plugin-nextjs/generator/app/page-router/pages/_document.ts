import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '@/gasket'; // tsconfig path alias

export default withGasketData(gasket)(Document);
