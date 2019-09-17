const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mdTable = require('markdown-table');

const writeFile = promisify(fs.writeFile);

const isUrl = /^(https?:)?\/\//;


async function generateIndex(docsConfigSet) {
  const { app: appDocs, docsRoot } = docsConfigSet;

  const links = [];
  let content = '';

  const addLine = (text = '') => { content += text + '\n'; };
  const addContent = (text = '') => { addLine(text); addLine(); };
  const addTable = elems => { addContent(mdTable(elems)); };
  const formatLink = (link, targetRoot) => isUrl.test(link) ? link : path.relative(docsRoot, path.join(targetRoot, link));

  addContent('<!-- generated by `gasket docs` -->');
  addContent('# App');
  addContent(`[${appDocs.name}] — ${appDocs.description}`);
  links.push([appDocs.name, formatLink(appDocs.link, appDocs.targetRoot)]);
  // addContent(appDocs.description || '');

  const addSection = (sectionTitle, sectionDesc, docs, { includeVersion = true } = {}) => {
    if (!docs || !docs.length) return;

    addContent(`## ${sectionTitle}`);
    addContent(sectionDesc);
    addTable([
      includeVersion ? ['Name', 'Version', 'Description'] : ['Name', 'Description'],
      ...docs.map(moduleDoc => {
        const { name, description, link, version, targetRoot } = moduleDoc;
        if (link) {
          links.push([name, formatLink(link, targetRoot)]);
        }
        return [link ? `[${name}]` : name, ...(includeVersion ? [version, description] : [description])];
      })
    ]);
  };

  addSection('Commands', 'Available commands', docsConfigSet.commands, { includeVersion: false });
  addSection('Lifecycles', 'Available lifecycles', docsConfigSet.lifecycles, { includeVersion: false });
  addSection('Structure', 'Available structure', docsConfigSet.structures, { includeVersion: false });
  addSection('Plugins', 'All configured plugins', docsConfigSet.plugins);
  addSection('Presets', 'All configured presets', docsConfigSet.presets);
  addSection('Modules', 'Some available modules', docsConfigSet.modules);

  addContent('<!-- LINKS -->');
  links.forEach(([name, link]) => {
    addLine(`[${name}]:${link}`);
  });

  return await writeFile(path.join(docsRoot, 'README.md'), content);
}

module.exports = generateIndex;
