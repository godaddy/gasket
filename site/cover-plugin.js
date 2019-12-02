//
// When the cover page is visible, hide the nav and snap to top
//

function install(hook) {
  hook.doneEach(function doneEach() {
    const nav = window.Docsify.dom.find('.app-nav');

    const isCover = window.location.hash === '#/';
    if (isCover) {
      nav.classList.add('hidden');
      window.scrollTo(0, 0);
    } else {
      nav.classList.remove('hidden');
    }
  });
}

window.$docsify.plugins = [].concat(install, window.$docsify.plugins);
