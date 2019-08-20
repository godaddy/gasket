function *nodeIdGenerator() {
  let counter = 0;
  while (true) {
    yield counter++;
  }
}

function commandNode(command) {
  return `${command}Cmd`;
}

function hookNode(plugin, event) {
  return `${plugin}_${event}_hook`;
}

function invokeNode(event, idGenerator) {
  return `invoke_${event}_${idGenerator.next().value}`;
}

module.exports = {
  commandNode,
  hookNode,
  invokeNode,
  nodeIdGenerator
};
