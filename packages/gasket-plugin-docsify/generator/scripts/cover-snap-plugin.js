//
// For cover pages that allow scroll, scroll to the top when made visible
//

function install(hook) {
  let cover;
  hook.mounted(function () {
    cover = window.Docsify.dom.find('.cover');
  });

  hook.doneEach(function doneEach() {
    if (cover && cover.classList.contains('show')) {
      window.scrollTo(0, 0);
    }
  });
}

window.$docsify.plugins = [].concat(install, window.$docsify.plugins);
