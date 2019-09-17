/* eslint-disable max-nested-callbacks */

const assume = require('assume');
const sinon = require('sinon');
const docsHook = require('../lib/docs');
const [
  txGasketLinks,
  txPackageLinks
] = docsHook().transforms;


describe('Docs Transforms', () => {
  describe('gasket links', () => {
    it('is global', () => {
      assume(txGasketLinks).property('global', true);
    });

    describe('test', () => {
      it('matches @gasket node_modules markdown files', () => {
        [
          '/path/to/node_modules/@gasket/some-plugin/README.md',
          '/path/to/node_modules/@gasket/something/README.md',
          '/path/to/node_modules/@gasket/some-preset/README.md'
        ].forEach(source => {
          assume(txGasketLinks.test.test(source)).equals(true, `Path ${source}`);
        });
      });

      it('matches linked monorepo package markdown files', () => {
        [
          '/path/to/packages/gasket-some-plugin/README.md',
          '/path/to/packages/gasket-something/README.md',
          '/path/to/packages/gasket-some-preset/README.md'
        ].forEach(source => {
          assume(txGasketLinks.test.test(source)).equals(true, `Path ${source}`);
        });
      });

      it('does not match non-markdown files', () => {
        [
          '/path/to/node_modules/@gasket/some-plugin/bogus.svg',
          '/path/to/node_modules/@gasket/something/bogus.png',
          '/path/to/node_modules/@gasket/some-preset/bogus.txt',
          '/path/to/packages/gasket-some-plugin/bogus.svg',
          '/path/to/packages/gasket-something/bogus.png',
          '/path/to/packages/gasket-some-preset/bogus.txt'
        ].forEach(source => {
          assume(txGasketLinks.test.test(source)).equals(false, `Path ${source}`);
        });
      });

      it('does not match non-@gasket files', () => {
        [
          '/path/to/node_modules/@some/cool-gasket-plugin/README.md',
          '/path/to/node_modules/@gasketz/something/README.md',
          '/path/to/node_modules/@some/cool-gasket-preset/README.md',
          '/path/to/my/cool-gasket-plugin/README.md',
          '/path/to/my/gasket/gasket-something/README.md',
          '/path/to/my/cool-gasket-preset/README.md'
        ].forEach(source => {
          assume(txGasketLinks.test.test(source)).equals(false, `Path ${source}`);
        });
      });
    });
  });

  describe('absolute links', () => {

    it('is global', () => {
      assume(txPackageLinks).property('global', true);
    });
  });

  describe('RegEx', () => {

    // describe('isGasketScope', () => {
    //   it('matches gasket scoped names', () => {
    //     [
    //       '@gasket/some-plugin',
    //       '@gasket/some-preset',
    //       '@gasket/something'
    //     ].forEach(source => {
    //       assume(isGasketScope.test(source)).equals(true, `Name ${source}`);
    //     });
    //   });
    //
    //   it('does not match non-gasket scoped names', () => {
    //     [
    //       '@some/cool-gasket-plugin',
    //       '@some/cool-gasket-preset',
    //       '@some/gasket-thing'
    //     ].forEach(source => {
    //       assume(isGasketScope.test(source)).equals(false, `Name ${source}`);
    //     });
    //   });
    // });

    // describe('isAbsolutePackageLink', () => {
    //   it('matches absolute package links', () => {
    //     [
    //       '@gasket/some-plugin',
    //       '@gasket/some-preset',
    //       '@gasket/something'
    //     ].forEach(source => {
    //       assume(isAbsolutePackageLink.test(source)).equals(true, `Link ${source}`);
    //     });
    //   });
    //
    //   it('does not matches non-absolute package links', () => {
    //     [
    //       '@gasket/some-plugin',
    //       '@gasket/some-preset',
    //       '@gasket/something'
    //     ].forEach(source => {
    //       assume(isAbsolutePackageLink.test(source)).equals(false, `Link ${source}`);
    //     });
    //   });
    // });
  });
});
