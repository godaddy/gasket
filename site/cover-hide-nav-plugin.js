//
// When the cover page is visible, hide the nav
//

function install(hook) {
  let cover;
  let nav;

  hook.doneEach(function doneEach() {
    cover = window.Docsify.dom.find('.cover');
    nav = window.Docsify.dom.find('.app-nav');

    const hide = cover && cover.classList.contains('show');
    if (hide) {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }
  });
}

window.$docsify.plugins = [].concat(install, window.$docsify.plugins);
