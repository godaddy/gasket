import type Document from 'next/document';
import type { ReactElement, ReactNode } from 'react';

export function isDocumentClass(maybeClass: any): maybeClass is typeof Document;

export function selectBody(children: ReactElement[]): [ReactElement, number];
