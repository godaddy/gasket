export interface TranspileResult {
  success: boolean;
  inputPath: string;
  outputPath: string;
  error?: string;
}

export interface ProgressInfo {
  file: string;
  outputPath: string;
  current: number;
  total: number;
}

export interface TranspileOptions {
  swcConfig?: object;
  extensions?: string[];
  createPackageJson?: boolean;
  onProgress?: (progress: ProgressInfo) => void;
}

export interface TranspileSummary {
  successful: TranspileResult[];
  failed: TranspileResult[];
  total: number;
  outputDir: string;
}

export function transpileFile(
  filePath: string,
  outputPath: string,
  swcConfig?: object
): Promise<TranspileResult>;

export function transpileDirectory(
  sourceDir: string,
  outputDir?: string,
  options?: TranspileOptions
): Promise<TranspileResult[]>;

export function fixImportExtensions(outputDir: string): Promise<void>;

export function transpile(
  sourceDir: string,
  outputDir?: string,
  options?: TranspileOptions
): Promise<TranspileSummary>;

