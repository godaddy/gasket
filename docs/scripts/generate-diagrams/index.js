const diagnostics = require('diagnostics');
const lifecycle = require('../common/lifecycle');
const getGraphContent = require('./graph-content');
const { generateDOT, generateLegendDOT } = require('./dot');
const generateSVG = require('./svg');
const { writeFile, tryMkdir, imagePath, rootDir } = require('./fs');
const debug = {
  file: diagnostics('generate:diagrams:file'),
  log: diagnostics('generate:diagrams')
};


async function generateLegend() {
  debug.log('generateLegend');
  const dot = generateLegendDOT();
  const svg = await generateSVG(dot);
  await writeFile(imagePath('./legend.svg'), svg);
}

async function generateFullDiagram() {
  debug.log('generateFullDiagram');
  return generateDiagram({
    commands: Object.keys(lifecycle.commands),
    filename: './full.svg'
  });
}

async function generateCommandDiagrams() {
  debug.log('generateCommandDiagrams');
  await tryMkdir(imagePath('./commands'));
  await Promise.all(
    Object.keys(lifecycle.commands).map(command => generateDiagram({
      commands: [command],
      filename: `./commands/${command}.svg`
    }))
  );
}

async function generateEventDiagrams() {
  debug.log('generateEventDiagrams');
  await tryMkdir(imagePath('./events'));
  const allEvents = new Set(
    Object
      .values(lifecycle.hooks)
      .map(eventMap => Object.keys(eventMap))
      .reduce((all, some) => all.concat(some), []));
  await Promise.all([...allEvents].map(async event => {
    return generateDiagram({
      events: [event],
      filename: `./events/${event}.svg`
    });
  }));
}

async function generatePluginDiagrams() {
  debug.log('generatePluginDiagrams');
  await tryMkdir(imagePath('./plugins'));
  await Promise.all(Object.keys(lifecycle.hooks).map(async plugin => {
    return generateDiagram({
      hooks: Object
        .keys(lifecycle.hooks[plugin])
        .map(event => ({ plugin, event, entry: true })),
      filename: `./plugins/${plugin}.svg`
    });
  }));
}

async function generateDiagram({ filename, ...graphParams }) {
  debug.log('generateDiagram', graphParams);

  const content = getGraphContent(graphParams);
  const dot = generateDOT(content);
  const svg = await generateSVG(dot);

  const target = imagePath(filename);
  debug.file(`Write ${target.replace(rootDir, '.')}`);
  await writeFile(target, svg);
}

async function run() {
  await Promise.all([
    generateLegend(),
    generateFullDiagram(),
    generateCommandDiagrams(),
    generateEventDiagrams(),
    generatePluginDiagrams()
  ]);
};

//
// Begin generating all diagrams
//
run().catch(err => {
  console.error(err);
  process.exit(1);
});
