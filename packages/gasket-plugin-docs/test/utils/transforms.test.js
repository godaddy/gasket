/* eslint-disable max-nested-callbacks, max-len */
const assume = require('assume');
const sinon = require('sinon');
const {
  makeLinkTransform,
  txGasketPackageLinks,
  txGasketUrlLinks,
  txAbsoluteLinks
} = require('../../lib/utils/transforms');


const mockInlineStyle = `
[1](path/to/doc.md) [2](../path/to/doc.md#with-hash) [3](/path/to/doc.md#with-hash)
[4](/packages/gasket-fake/doc.md#with-hash)
[5](/packages/not-gasket/doc.md#with-hash)
[6](https://github.com/godaddy/gasket/tree/canary/packages/gasket-fake/path/to/doc.md#with-hash)
[7](https://doc.gasket.dev)
`;

const mockReferenceStyle = `
[1]:path/to/doc.md
[2]: ../path/to/doc.md#with-hash
[3]:/path/to/doc.md#with-hash
[4]: /packages/gasket-fake/doc.md#with-hash
[5]:/packages/not-gasket/doc.md#with-hash
[6]: https://github.com/godaddy/gasket/tree/canary/packages/gasket-fake/path/to/doc.md#with-hash
[7]:https://doc.gasket.dev
`;

describe('Utils Transforms', () => {

  describe('makeLinkTransform', () => {
    it('returns a function', () => {
      const results = makeLinkTransform(f => f);
      assume(results).is.a('function');
    });

    it('callback is not called if no links', () => {
      const mockCallback = sinon.stub();
      makeLinkTransform(mockCallback)('not much here');
      assume(mockCallback).is.not.called();
    });

    it('callback is executed for all matching links', () => {
      const mockCallback = sinon.stub();
      makeLinkTransform(mockCallback)(mockInlineStyle);
      assume(mockCallback).is.called(7);
    });

    it('callback is passed link', () => {
      const mockCallback = sinon.stub();
      makeLinkTransform(mockCallback)(mockInlineStyle);
      assume(mockCallback).is.calledWith('path/to/doc.md');
    });

    it('matches inline links', () => {
      const mockCallback = sinon.stub();
      makeLinkTransform(mockCallback)(mockInlineStyle);
      assume(mockCallback).is.calledWith('path/to/doc.md');
      assume(mockCallback).is.calledWith('../path/to/doc.md#with-hash');
      assume(mockCallback).is.calledWith('/path/to/doc.md#with-hash');
      assume(mockCallback).is.calledWith('/packages/gasket-fake/doc.md#with-hash');
      assume(mockCallback).is.calledWith('/packages/not-gasket/doc.md#with-hash');
      assume(mockCallback).is.calledWith('https://github.com/godaddy/gasket/tree/canary/packages/gasket-fake/path/to/doc.md#with-hash');
      assume(mockCallback).is.calledWith('https://doc.gasket.dev');
    });

    it('matches reference links', () => {
      const mockCallback = sinon.stub();
      makeLinkTransform(mockCallback)(mockReferenceStyle);
      assume(mockCallback).is.calledWith('path/to/doc.md');
      assume(mockCallback).is.calledWith('../path/to/doc.md#with-hash');
      assume(mockCallback).is.calledWith('/path/to/doc.md#with-hash');
      assume(mockCallback).is.calledWith('/packages/gasket-fake/doc.md#with-hash');
      assume(mockCallback).is.calledWith('/packages/not-gasket/doc.md#with-hash');
      assume(mockCallback).is.calledWith('https://github.com/godaddy/gasket/tree/canary/packages/gasket-fake/path/to/doc.md#with-hash');
      assume(mockCallback).is.calledWith('https://doc.gasket.dev');
    });

    it('transforms inline links', () => {
      const results = makeLinkTransform(link => link.replace('doc', 'bogus'))(mockInlineStyle);
      assume(results).equals(`
[1](path/to/bogus.md) [2](../path/to/bogus.md#with-hash) [3](/path/to/bogus.md#with-hash)
[4](/packages/gasket-fake/bogus.md#with-hash)
[5](/packages/not-gasket/bogus.md#with-hash)
[6](https://github.com/godaddy/gasket/tree/canary/packages/gasket-fake/path/to/bogus.md#with-hash)
[7](https://bogus.gasket.dev)
`);
    });

    it('transforms reference links', () => {
      const results = makeLinkTransform(link => link.replace('doc', 'bogus'))(mockReferenceStyle);
      assume(results).equals(`
[1]:path/to/bogus.md
[2]: ../path/to/bogus.md#with-hash
[3]:/path/to/bogus.md#with-hash
[4]: /packages/gasket-fake/bogus.md#with-hash
[5]:/packages/not-gasket/bogus.md#with-hash
[6]: https://github.com/godaddy/gasket/tree/canary/packages/gasket-fake/path/to/bogus.md#with-hash
[7]:https://bogus.gasket.dev
`);
    });

    it('falls back to original if callback does not return', () => {
      const results = makeLinkTransform(() => { /* does nothing */ })(mockReferenceStyle);
      assume(results).equals(mockReferenceStyle);
    });
  });

  describe('txGasketPackageLinks', () => {
    const { test, handler } = txGasketPackageLinks;

    it('is global', () => {
      assume(txGasketPackageLinks).property('global', true);
    });

    describe('test', () => {
      it('matches @gasket node_modules markdown files', () => {
        [
          '/path/to/node_modules/@gasket/plugin-some/README.md',
          '/path/to/node_modules/@gasket/something/README.md',
          '/path/to/node_modules/@gasket/some-preset/README.md'
        ].forEach(source => {
          assume(test.test(source)).equals(true, `Path ${source}`);
        });
      });

      it('matches linked gasket repo package markdown files', () => {
        [
          '/path/to/packages/gasket-plugin-some/README.md',
          '/path/to/packages/gasket-something/README.md',
          '/path/to/packages/gasket-preset-some/README.md'
        ].forEach(source => {
          assume(test.test(source)).equals(true, `Path ${source}`);
        });
      });

      it('does not match non-markdown files', () => {
        [
          '/path/to/node_modules/@gasket/plugin-some/bogus.svg',
          '/path/to/node_modules/@gasket/something/bogus.png',
          '/path/to/node_modules/@gasket/some-preset/bogus.txt',
          '/path/to/packages/gasket-plugin-some/bogus.svg',
          '/path/to/packages/gasket-something/bogus.png',
          '/path/to/packages/gasket-preset-some/bogus.txt'
        ].forEach(source => {
          assume(test.test(source)).equals(false, `Path ${source}`);
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
          assume(test.test(source)).equals(false, `Path ${source}`);
        });
      });
    });

    describe('handler', () => {
      let mockDocsConfig;

      beforeEach(() => {
        mockDocsConfig = { name: '@gasket/fake' };
      });

      it('is named', () => {
        assume(handler).property('name', 'txGasketPackageLinks');
      });

      it('transforms absolute links under gasket repo to be URLs', () => {
        const results = handler(mockInlineStyle, { docsConfig: mockDocsConfig });
        assume(results).not.equals(mockInlineStyle);
        assume(results).not.includes('[4](/packages/gasket-fake/doc.md#with-hash)');
        assume(results).includes('[4](https://github.com/godaddy/gasket/tree/master/packages/gasket-fake/doc.md#with-hash)');
      });

      it('does not process if non-@gasket module', () => {
        mockDocsConfig.name = '@not/a-gasket-module';
        const results = handler(mockInlineStyle, { docsConfig: mockDocsConfig });
        assume(results).equals(mockInlineStyle);
      });
    });
  });

  describe('txGasketUrlLinks', () => {
    const { test, handler } = txGasketUrlLinks;

    it('is global', () => {
      assume(txGasketUrlLinks).property('global', true);
    });

    describe('test', () => {
      it('matches markdown files', () => {
        [
          'README.md',
          '/path/to/any/README.md'
        ].forEach(source => {
          assume(test.test(source)).equals(true, `Path ${source}`);
        });
      });

      it('does not match non-markdown files', () => {
        [
          'vector.svg',
          'raster.png',
          'text.txt',
          '/path/to/vector.svg',
          '/path/to/raster.png',
          '/path/to/text.txt'
        ].forEach(source => {
          assume(test.test(source)).equals(false, `Path ${source}`);
        });
      });

      describe('handler', () => {
        let docsConfigSet, docsConfig, filename;

        beforeEach(() => {
          docsConfig = { name: '@gasket/plugin-fake', targetRoot: '/path/to/some-app/.docs/plugins/@gasket/plugin-fake' };

          docsConfigSet = {
            plugins: [{ name: '@gasket/plugin-fake', targetRoot: '/path/to/some-app/.docs/plugins/@gasket/plugin-fake' }],
            presets: [{ name: '@gasket/fake-preset', targetRoot: '/path/to/some-app/.docs/presets/@gasket/fake-preset' }],
            modules: [{ name: '@gasket/fake', targetRoot: '/path/to/some-app/.docs/modules/@gasket/fake' }],
            docs: '/path/to/some-app',
            docsRoot: '/path/to/some-app/.docs'
          };

          filename = 'README.md';
        });

        it('is named', () => {
          assume(handler).property('name', 'txGasketUrlLinks');
        });

        it('transforms gasket repo URLs to relative links', () => {
          const results = handler(mockInlineStyle, { filename, docsConfig, docsConfigSet });
          assume(results).not.includes('[6](https://github.com/godaddy/gasket/tree/canary/packages/gasket-fake/path/to/doc.md#with-hash)');
          assume(results).includes('[6](../../../../modules/@gasket/fake/path/to/doc.md#with-hash)');
        });

        it('transforms gasket repo URLs under any branch', () => {
          const mockContent = `
[master](https://github.com/godaddy/gasket/tree/master/packages/gasket-fake/path/to/doc.md#with-hash)
[BOGUS](https://github.com/godaddy/gasket/tree/BOGUS/packages/gasket-fake/path/to/doc.md#with-hash)
[canary-1.7](https://github.com/godaddy/gasket/tree/canary-1.7/packages/gasket-fake/path/to/doc.md#with-hash)
`;
          const results = handler(mockContent, { filename, docsConfig, docsConfigSet });
          assume(results).includes('[master](../../../../modules/@gasket/fake/path/to/doc.md#with-hash)');
          assume(results).includes('[BOGUS](../../../../modules/@gasket/fake/path/to/doc.md#with-hash)');
          assume(results).includes('[canary-1.7](../../../../modules/@gasket/fake/path/to/doc.md#with-hash)');
        });

        it('does not transforms gasket repo URLs if module not collated', () => {
          const mockContent = `[missing](https://github.com/godaddy/gasket/tree/master/packages/gasket-missing/path/to/doc.md#with-hash)`;
          const results = handler(mockContent, { filename, docsConfig, docsConfigSet });
          assume(results).includes(mockContent);
          assume(results).not.includes('[missing](../../../../modules/@gasket/missing/path/to/doc.md#with-hash)');
        });

        it('does not transform non gasket repo URLs', () => {
          const results = handler(mockInlineStyle, { filename, docsConfig, docsConfigSet });
          assume(results).includes('[7](https://doc.gasket.dev)');
        });
      });
    });
  });

  describe('txAbsoluteLinks', () => {
    const { test, handler } = txAbsoluteLinks;

    it('is global', () => {
      assume(txAbsoluteLinks).property('global', true);
    });

    describe('test', () => {
      it('matches markdown files', () => {
        [
          'README.md',
          '/path/to/any/README.md'
        ].forEach(source => {
          assume(test.test(source)).equals(true, `Path ${source}`);
        });
      });

      it('does not match non-markdown files', () => {
        [
          'vector.svg',
          'raster.png',
          'text.txt',
          '/path/to/vector.svg',
          '/path/to/raster.png',
          '/path/to/text.txt'
        ].forEach(source => {
          assume(test.test(source)).equals(false, `Path ${source}`);
        });
      });
    });

    describe('handler', () => {
      let docsConfig;

      beforeEach(() => {
        docsConfig = { name: '@gasket/plugin-fake', targetRoot: '/path/to/some-app/.docs/plugins/@gasket/plugin-fake' };
      });

      it('is named', () => {
        assume(handler).property('name', 'txAbsoluteLinks');
      });

      it('transform absolute links to relative', () => {
        const mockContent = `
[1](/path/to/peer-doc.md#with-hash)
[2](/path/to/deep/doc.md#with-hash)
[3](/root-doc.md#with-hash)
`;
        const filename = '/path/to/begin.md';

        const results = handler(mockContent, { filename, docsConfig });
        assume(results).not.includes(mockContent);
        assume(results).includes('[1](peer-doc.md#with-hash)');
        assume(results).includes('[2](deep/doc.md#with-hash)');
        assume(results).includes('[3](../../root-doc.md#with-hash)');
      });

      it('does not transform relative links', () => {
        const mockContent = `
[1](peer-doc.md#with-hash)
[2](deep/doc.md#with-hash)
[3](../../root-doc.md#with-hash)
`;
        const filename = '/path/to/begin.md';

        const results = handler(mockContent, { filename, docsConfig });
        assume(results).includes(mockContent);
      });
    });
  });
});
