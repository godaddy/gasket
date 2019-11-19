/* eslint-disable max-statements */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mdTable = require('markdown-table');

const writeFile = promisify(fs.writeFile);

const isUrl = /^(https?:)?\/\//;

/**
 * Generates the index README.md
 *
 * @param {DocsConfigSet} docsConfigSet - Docs generation configs
 * @returns {Promise<string>} filename
 */
function generateContent(docsConfigSet) {
  const { app: appDocs, docsRoot } = docsConfigSet;

  const refMap = new Map();
  let content = '';
  let idx = 0;

  function uniqueRef(ref) {
    return refMap.has(ref) ? ++idx : ref;
  }

  const addLine = (text = '') => { content += text + '\n'; };
  const addContent = (text = '') => { addLine(text); addLine(); };
  const addTable = elems => { addContent(mdTable(elems)); };
  const formatLink = (link, targetRoot) => isUrl.test(link) ? link : path.relative(docsRoot, path.join(targetRoot, link));

  addContent('<!-- generated by `gasket docs` -->');
  addContent('# App');
  addContent(`[${appDocs.name}] — ${appDocs.description}`);
  refMap.set(appDocs.name, formatLink(appDocs.link, appDocs.targetRoot));

  const addSection = (sectionTitle, sectionDesc, docs, { includeVersion = true } = {}) => {
    if (!docs || !docs.length) return;

    addContent(`## ${sectionTitle}`);
    addContent(sectionDesc);
    addTable([
      includeVersion ? ['Name', 'Version', 'Description'] : ['Name', 'Description'],
      ...docs.map(moduleDoc => {
        const { name, description, link, version, targetRoot } = moduleDoc;
        let itemName = name;
        if (link) {
          const ref = uniqueRef(name);
          itemName = ref === name ? `[${name}]` : `[${name}][${ref}]`;
          refMap.set(ref, formatLink(link, targetRoot));
        }
        return [itemName, ...(includeVersion ? [version, description] : [description])];
      })
    ]);
  };

  addSection('Guides', ' Help and explanations docs', docsConfigSet.guides, { includeVersion: false });
  addSection('Commands', 'Available commands', docsConfigSet.commands, { includeVersion: false });
  addSection('Lifecycles', 'Available lifecycles', docsConfigSet.lifecycles, { includeVersion: false });
  addSection('Structures', 'Available structure', docsConfigSet.structures, { includeVersion: false });
  addSection('Presets', 'All configured presets', docsConfigSet.presets);
  addSection('Plugins', 'All configured plugins', docsConfigSet.plugins);
  addSection('Modules', 'Dependencies and supporting modules', docsConfigSet.modules);

  addContent('<!-- LINKS -->');
  for (const [name, link] of refMap) {
    addLine(`[${name}]:${link}`);
  }

  return content;
}

/**
 * Generates the index README.md
 *
 * @param {DocsConfigSet} docsConfigSet - Docs generation configs
 * @returns {Promise<string>} filename
 */
async function generateIndex(docsConfigSet) {
  const { docsRoot } = docsConfigSet;

  const target = path.join(docsRoot, 'README.md');
  const content = await generateIndex.generateContent(docsConfigSet);
  await writeFile(target, content);
  return target;
}

generateIndex.generateContent = generateContent;

module.exports = generateIndex;

