import { readFile } from 'fs/promises';

/** @type {import('../index.js').Readme} */
export default class Readme {
  constructor() {
    this.markdown = [];
    this.links = [];
  }

  addNewLine() {
    this.markdown.push('');
    return this;
  }

  heading(content, level = 2) {
    this.markdown.push(`${'#'.repeat(level)} ${content}`);
    return this.addNewLine();
  }

  subHeading(content) {
    return this.heading(content, 3);
  }

  content(content) {
    this.markdown.push(content);
    return this.addNewLine();
  }

  list(items) {
    this.markdown.push(...items.map(item => `- ${item}`));
    return this.addNewLine();
  }

  link(content, href) {
    this.links.push(`[${content}]: ${href}`);
    return this;
  }

  codeBlock(content, syntax = '') {
    this.markdown.push(`\`\`\`${syntax}`);
    this.markdown.push(content);
    this.markdown.push('```');
    return this.addNewLine();
  }

  async markdownFile(path) {
    const content = await readFile(path, 'utf8');
    this.markdown.push(content);
    return this.addNewLine();
  }
}
