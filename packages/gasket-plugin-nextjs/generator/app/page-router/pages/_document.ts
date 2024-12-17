import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '@/gasket'; // tsconfig path alias
{{else}}
{{#if nextDevProxy}}
import gasket from '@/gasket';
{{else}}
import gasket from '../gasket';
{{/if}}
{{/if}}
export default withGasketData(gasket)(Document);
