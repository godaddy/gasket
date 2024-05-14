export declare type GitIgnoreContent = {
  dependencies: Set<string>;
  testing: Set<string>;
  production: Set<string>;
  misc: Set<string>;
  special: Set<string>;
};

/** Class to add content to gitignore */
export declare class Gitignore {
  _content: GitignoreContent;

  constructor();

  /**
   * Adds content to gitignore
   * @param {string | string[]} name - name of file or directory to add to
   * gitignore
   * @param {string} category - category of gitignore content
   */
  add(name: string | string[], category?: string): void;
}
