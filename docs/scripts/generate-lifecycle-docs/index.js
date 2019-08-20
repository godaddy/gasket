const path = require('path');
const { promisify } = require('util');
const fs = require('fs');

const documentationLink = require('../common/documentation-link');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readDir = promisify(fs.readdir);

const { documentation } = require('../common/lifecycle');

const EXTENSION = /\..*$/;
const EXTENSIBILITY_DOC = path.resolve(
  __dirname,
  '../../guides/extensibility.md');
const autoGenSection = /<!-- BEGIN_LIFECYCLE_AUTOGEN -->(.|\n)*?<!-- END_LIFECYCLE_AUTOGEN -->/m;

async function generateReferenceLinks() {
  const [
    commandContent,
    pluginContent,
    eventContent
  ] = await Promise.all([
    generateCommandLinks(),
    generatePluginLinks(),
    generateEventLinks()
  ]);

  return `
* [Flowchart legend](../images/lifecycle/legend.svg)
* [Full lifecycle flowchart](../images/lifecycle/full.svg)
${commandContent}
${pluginContent}
${eventContent}
`;
}

function generateCommandLinks() {
  return generateLinksSection({
    title: 'Gasket Commands',
    entityType: 'command'
  });
}

function generatePluginLinks() {
  return generateLinksSection({
    title: 'Plugins',
    entityType: 'plugin'
  });
}

function generateEventLinks() {
  return generateLinksSection({
    title: 'Lifecycle Events',
    entityType: 'event'
  });
}

async function generateLinksSection({ title, entityType }) {
  const collection = `${entityType}s`;
  const imagesPath = path.resolve(
    __dirname,
    `../../images/lifecycle/${collection}`);
  const imageFiles = await readDir(imagesPath);
  const entitiesWithImages = new Set(imageFiles
    .map(name => name.replace(EXTENSION, '')));
  const allEntities = new Set([
    ...entitiesWithImages,
    ...Object
      .keys(documentation[collection])
      .filter(str => str !== '_default')
  ]);

  const items = [...allEntities].sort().map(entity => {
    const docHref = documentationLink(entityType, entity);
    const parts = [
      entity,
      docHref ? `[docs](${docHref})` : 'docs TBD'
    ];

    if (entitiesWithImages.has(entity)) {
      const imageURL = `../images/lifecycle/${collection}/${entity}.svg`;
      parts.push(`[flow chart](${imageURL})`);
    }

    return `  * ${parts.join(' - ')}`;
  });

  return '* ' + title + '\n' + items.join('\n');
}

async function run() {
  const [
    markdown,
    generatedContent
  ] = await Promise.all([
    readFile(EXTENSIBILITY_DOC, 'utf8'),
    generateReferenceLinks()
  ]);

  const wrappedContent =
`<!-- BEGIN_LIFECYCLE_AUTOGEN -->
${generatedContent}
<!-- END_LIFECYCLE_AUTOGEN -->`;

  await writeFile(
    EXTENSIBILITY_DOC,
    markdown.replace(autoGenSection, wrappedContent),
    'utf8');
}

//
// Begin generating all diagrams
//
run().catch(err => {
  console.error(err);
  process.exit(1);
});
