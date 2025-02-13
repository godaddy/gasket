export interface GitIgnoreContent {
  dependencies: Set<string>;
  testing: Set<string>;
  production: Set<string>;
  misc: Set<string>;
  special: Set<string>;
  documentation?: Set<string>;
}

/** Valid categories for gitignore content */
export type GitIgnoreCategory = keyof GitIgnoreContent;

/** Class to add content to gitignore */
export declare class Gitignore {
  readonly _content: GitIgnoreContent;

  constructor(): void;

  /**
   * Adds content to gitignore
   */
  add(
    /** Name of file or directory to add to gitignore */
    name: string | string[],
    /** Category of gitignore content (must be a valid category from GitIgnoreContent) */
    category?: GitIgnoreCategory): void;
}
