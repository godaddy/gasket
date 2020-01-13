//
// Table of contents may be authored in markdown with heading links suitable
// for viewing on various git platforms. This plugin simplifies ids from slugs
// allowing TOC links to also work when viewed with Docsify.
//

function install(hook) {
  hook.afterEach(function (html, next) {
    const nextHtml = html.replace(/(id="?)([^"]+)"/g, (match, p1, p2) => {
      const fixed = p2
        .replace(/%\w+/g, '')
        .replace(/[^a-z0-9- _]/g, '')
        .replace(/--+/g, '-');

      return p1 + fixed + '"';
    });
    next(nextHtml);
  });
}

window.$docsify.plugins = [].concat(install, window.$docsify.plugins);
