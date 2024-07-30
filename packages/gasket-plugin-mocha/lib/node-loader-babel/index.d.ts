export function load(
  url: string,
  context: { format: string },
  defaultLoad: (url: string, context: { format: string }, defaultLoad: any) => Promise<{ source: string | null, format: string }>
): Promise<{ source: string | null, format: string }>;
