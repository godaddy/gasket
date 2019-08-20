const lifecycle = require('../common/lifecycle');
const { commandNode, hookNode, invokeNode, nodeIdGenerator } = require('./nodes');

function getGraphContent({ commands = [], events = [], hooks = [] }) {
  const visitLog = startVisitLog(commands, events, hooks);

  visitCommands(visitLog);
  if (commands.length > 1) {
    visitPreCommandFlow(visitLog);
  }

  visitHooks(visitLog);
  visitFlows(visitLog);

  return {
    commands: visitLog.commands,
    events: [...visitLog.events],
    invokes: visitLog.invokes,
    hooks: visitLog.hooks,
    flows: visitLog.flows
  };
}

function startVisitLog(commands, events, hooks) {
  const invokes = [];
  const flows = [];
  const idGenerator = nodeIdGenerator();
  return { commands, events: new Set(events), invokes, hooks, flows, idGenerator };
}

function visitCommands(visitLog) {
  for (let command of visitLog.commands) {
    visitCommand(command, visitLog);
  }
}

function visitCommand(command, visitLog) {
  return visitFlow(commandNode(command), lifecycle.commands[command], visitLog);
}

function visitHooks(visitLog) {
  for (let { plugin, event } of visitLog.hooks) {
    visitFlow(
      hookNode(plugin, event),
      lifecycle.hooks[plugin][event],
      visitLog);
  }
}

function visitFlows(visitLog) {
  const hooksByEvent = getHooksByEvent();

  for (let event of visitLog.events) {
    // NOTE: strange behavior. The `events` set may have items added to it as
    // we iterate. Node apparently handles this ok. Using this to help with
    // recursively adding events.
    for (let plugin of hooksByEvent[event] || []) {
      visitLog.hooks.push({ plugin, event });
      visitFlow(
        hookNode(plugin, event),
        lifecycle.hooks[plugin][event],
        visitLog);
    }
  }
}

function visitPreCommandFlow(visitLog) {
  const flow = visitFlow(commandNode('gasket'), lifecycle.preCommand, visitLog);

  // Connect the commands to the last step of the init flow
  const lastPreCommandStep = flow[flow.length - 1];
  Object.keys(lifecycle.commands).forEach(cmd => {
    visitLog.flows.push([lastPreCommandStep, commandNode(cmd)]);
  });

  // Add a pseudo-command node
  visitLog.commands.push('gasket');
}

function getHooksByEvent() {
  const hooksByEvent = {};
  for (let plugin of Object.keys(lifecycle.hooks)) {
    for (let event of Object.keys(lifecycle.hooks[plugin])) {
      hooksByEvent[event] = (hooksByEvent[event] || []).concat([plugin]);
    }
  }
  return hooksByEvent;
}

function visitFlow(startNode, flow, { events, invokes, hooks, flows, idGenerator }) {
  if (!flow.length) {
    return;
  }

  const flowSteps = [startNode, ...flow.map(event => {
    events.add(event);
    const node = invokeNode(event, idGenerator);
    invokes.push({ node, event });
    return node;
  })];

  flows.push(flowSteps);

  return flowSteps;
}

module.exports = getGraphContent;
