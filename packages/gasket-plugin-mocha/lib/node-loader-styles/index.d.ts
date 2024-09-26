export function resolve(specifier: string, context: any, defaultResolve: any): {
  url: string;
  shortCircuit: boolean;
} | ReturnType<typeof defaultResolve>;

export function load(url: string, context: any, defaultLoad: any): {
  format: string;
  source: string;
  shortCircuit: boolean;
} | ReturnType<typeof defaultLoad>;
