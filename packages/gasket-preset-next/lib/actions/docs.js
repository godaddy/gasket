import deps from '../../generator/dependencies.json' with { type: 'json'};

export default async function handleDocs(context) {
  const { useDocs, useDocusaurus, pkg, typescript } = context;

  if (useDocs) {
    pkg.add('dependencies', {
      '@gasket/plugin-docs': deps['@gasket/plugin-docs'],
      '@gasket/plugin-metadata': deps['@gasket/plugin-metadata']
    });

    pkg.add('scripts', {
      'docs': typescript ? 'tsx gasket.ts docs' : 'node gasket.js docs'
    });
  }

  if (useDocusaurus) {
    pkg.add('dependencies', {
      '@gasket/plugin-docusaurus': deps['@gasket/plugin-docusaurus']
    });
  }
};
