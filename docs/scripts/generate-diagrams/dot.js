const {
  COMMAND_NODE, EVENT_NODE, INVOKE_NODE, INVOKE_EDGE, FLOW_EDGE, HOOK_NODE
} = require('./styles');
const { commandNode, hookNode } = require('./nodes');
const documentationLink = require('../common/documentation-link');

function generateLegendDOT() {
  return `digraph {
    rankdir=LR;
    
    subgraph clusterLegend {
      label=Key;

      ${declareNode('command', COMMAND_NODE)}
      ${declareNode('invoke', { ...INVOKE_NODE, label: 'event' })}
      ${declareNode('event', EVENT_NODE)}
      ${declareNode('plugin', HOOK_NODE)}
      
      edge [style=invis];
      node [shape=plaintext];
      command -> "Gasket command";
      event -> "Lifecycle event";
      plugin -> "Plugin hook";
      invoke -> "Event invoked";
    }
  }`
}

function generateDOT({ commands, events, invokes, hooks, flows }) {
  return `
    digraph {
      ${edgeAttribs(FLOW_EDGE)}
      ${declareCommandNodes(commands)}
      ${declareEventNodes(events)}
      ${declareHookNodes(hooks)}
      ${createFlowGraphs(flows)}
    
      ${edgeAttribs(INVOKE_EDGE)}  
      ${createEventInvokeGraphs(invokes)}
    }
  `;
}

function declareCommandNodes(commands) {
  return `
    ${nodeAttribs(COMMAND_NODE)}
    ${statementForEach(commands, command => 
      declareNode(commandNode(command), { 
        label: command,
        href: documentationLink('command', command)
      })
    )}
  `;
}

function declareEventNodes(events) {
  return `
    ${nodeAttribs(EVENT_NODE)}
    ${statementForEach(events, event => declareNode(event, {
      href: documentationLink('event', event)
    }))}
  `;
}

function declareHookNodes(hooks) {
  return `
    ${nodeAttribs(HOOK_NODE)}
    ${statementForEach(hooks, ({ plugin, event, entry }) => {
      const node = hookNode(plugin, event);
      const label = entry 
        ? `${plugin}-plugin\n${event} hook` 
        : `${plugin}-plugin`;
      const href = documentationLink('plugin', plugin);
      
      return `
        ${declareNode(node, { label, href })}
        ${entry ? '' : `${event} -> ${node}:n;`}
      `;
    })}
  `;
}

function createFlowGraphs(flows) {
  return `
    ${nodeAttribs(INVOKE_NODE)}
    ${statementForEach(flows, flow => `${flow.join(' -> ')};`)}
  `;
}

function createEventInvokeGraphs(invokes) {
  return statementForEach(invokes, ({ node, event }) => `
    { ${declareNode(node, { label: event })} } -> ${event};
  `);
}

function declareNode(name, attribs) {
  return `${name} ${attribsTag(attribs)};`;
}

function statementForEach(array, cb) {
  return array.map(cb).join('\n');
}

function nodeAttribs(attribs) {
  return `node ${attribsTag(attribs)};`;
}

function edgeAttribs(attribs) {
  return `edge ${attribsTag(attribs)};`;
}

function attribsTag(attribs) {
  if (!attribs) return '';

  return `[${
    Object
      .entries(attribs)
      .filter(([attrib, value]) => value !== null)
      .map(([attrib, value]) => `${attrib}=${JSON.stringify(value)}`)
      .join(', ')
    }]`;
}

module.exports = {
  generateDOT,
  generateLegendDOT
};
