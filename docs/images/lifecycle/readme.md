# Updating Lifecycle Diagrams

First of all, you must have [Graphviz](https://www.graphviz.org/) installed to
generate lifecycle diagrams, and the `dot` command it installs must be in the
path. If this dependency is met, edit the 
[`/scripts/common/lifecycle.json`](../../scripts/common/lifecycle.json) file and run this
command:

```shell
cd ./scripts
npm run generate
```
