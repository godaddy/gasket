//
// Adds a table of contents link to the top of sidebar nav to return to an index page
//

function install(hook, vm) {
  const CONFIG = {
    tocLink: '#/',
    tocTitle: 'Table of Contents'
  };

  const dom = window.Docsify.dom;

  const toc = vm.config || {};
  const tocLink = toc.tocLink || CONFIG.tocLink;
  const tocText = toc.tocTitle || CONFIG.tocTitle;

  const li = dom.create('li', `<a class="toc-link" href="${tocLink}">${tocText}</a>`);

  hook.doneEach(function doneEach() {
    const hash = window.location.hash.split('?')[0];
    const sidebar = dom.find('.sidebar-nav');
    if (hash !== tocLink && sidebar.firstChild instanceof HTMLUListElement) {
      const list = sidebar.firstChild;
      list.insertBefore(li, list.firstChild);
    }
  });
}

window.$docsify.plugins = [].concat(install, window.$docsify.plugins);
