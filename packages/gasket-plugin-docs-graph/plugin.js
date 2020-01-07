module.exports = {
  name: 'docs-graph',
  hooks: {
    async docGraphs(gasket, data) {
      let graph = 'graph TD;\n'
      data.lifecycles.forEach(lifecycle => {
        const invokedLifecycle = lifecycle.name;
        const from = lifecycle.parent || lifecycle.after || lifecycle.command || lifecycle.from;
        if(invokedLifecycle !== from) {
          graph += `${from} --> ${invokedLifecycle};\n`;
        }
      });

      graph = graph.replace(/@/g, '');

      const content = '```mermaid\n' + graph + '\n```';

      return {
        name: 'Lifecycles',
        content
      };
    }
  }
}
