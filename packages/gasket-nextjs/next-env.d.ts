declare module 'next/script' {
  import { ComponentType } from 'react';
  const NextScript: ComponentType;
  export default NextScript;
}

declare module 'next/headers' {
  export function cookies(): {
    get(name: string): { value: string } | undefined;
    getAll(): { name: string; value: string }[];
  };
  export function headers(): {
    get(name: string): string | null;
    getAll(): string[];
  };
}

declare module 'next/app' {
  export interface AppContext {
    Component: any;
    ctx: any;
    AppTree: any;
  }
}

declare module 'next/document' {
  import { ComponentType } from 'react';

  export interface DocumentInitialProps {
    html: string;
    head?: any[];
    styles?: any[];
  }

  class Document extends ComponentType {
    static getInitialProps(ctx: any): Promise<DocumentInitialProps>;
    render(): JSX.Element;
  }
  export default Document;
}
