module.exports = {
  name: 'docs-graph',
  hooks: {
    async docGraphs(gasket, data) {
      let graph = 'graph LR;\n';
      data.lifecycles.forEach(lifecycle => {
        const name = lifecycle.name;
        const from = lifecycle.parent || lifecycle.after || lifecycle.command || lifecycle.from;
        const arrow = lifecycle.method ? `-- ${lifecycle.method} -->` : '-->';
        if (name !== from) {
          graph += `${from} ${arrow} ${name};\n`;
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
