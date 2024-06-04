import type Document from 'next/document';
import { ReactElement, ReactNode } from 'react';

export function isDocumentClass(maybeClass: any): maybeClass is typeof Document;

export function selectBody(children: ReactNode[]): [ReactElement, number];
