/* eslint-disable max-nested-callbacks, max-len */
import { vi } from 'vitest';
import {
  makeLinkTransform,
  txGasketPackageLinks,
  txGasketUrlLinks,
  txAbsoluteLinks
} from '../../lib/utils/transforms.js';


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
      expect(results).toEqual(expect.any(Function));
    });

    it('callback is not called if no links', () => {
      const mockCallback = vi.fn();
      makeLinkTransform(mockCallback)('not much here');
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('callback is executed for all matching links', () => {
      const mockCallback = vi.fn();
      makeLinkTransform(mockCallback)(mockInlineStyle);
      expect(mockCallback).toHaveBeenCalledTimes(7);
    });

    it('callback is passed link', () => {
      const mockCallback = vi.fn();
      makeLinkTransform(mockCallback)(mockInlineStyle);
      expect(mockCallback).toHaveBeenCalledWith('path/to/doc.md');
    });

    it('matches inline links', () => {
      const mockCallback = vi.fn();
      makeLinkTransform(mockCallback)(mockInlineStyle);
      expect(mockCallback).toHaveBeenCalledWith('path/to/doc.md');
      expect(mockCallback).toHaveBeenCalledWith('../path/to/doc.md#with-hash');
      expect(mockCallback).toHaveBeenCalledWith('/path/to/doc.md#with-hash');
      expect(mockCallback).toHaveBeenCalledWith('/packages/gasket-fake/doc.md#with-hash');
      expect(mockCallback).toHaveBeenCalledWith('/packages/not-gasket/doc.md#with-hash');
      expect(mockCallback).toHaveBeenCalledWith('https://github.com/godaddy/gasket/tree/canary/packages/gasket-fake/path/to/doc.md#with-hash');
      expect(mockCallback).toHaveBeenCalledWith('https://doc.gasket.dev');
    });

    it('matches reference links', () => {
      const mockCallback = vi.fn();
      makeLinkTransform(mockCallback)(mockReferenceStyle);
      expect(mockCallback).toHaveBeenCalledWith('path/to/doc.md');
      expect(mockCallback).toHaveBeenCalledWith('../path/to/doc.md#with-hash');
      expect(mockCallback).toHaveBeenCalledWith('/path/to/doc.md#with-hash');
      expect(mockCallback).toHaveBeenCalledWith('/packages/gasket-fake/doc.md#with-hash');
      expect(mockCallback).toHaveBeenCalledWith('/packages/not-gasket/doc.md#with-hash');
      expect(mockCallback).toHaveBeenCalledWith('https://github.com/godaddy/gasket/tree/canary/packages/gasket-fake/path/to/doc.md#with-hash');
      expect(mockCallback).toHaveBeenCalledWith('https://doc.gasket.dev');
    });

    it('transforms inline links', () => {
      const results = makeLinkTransform(link => link.replace('doc', 'bogus'))(mockInlineStyle);
      expect(results).toEqual(`
[1](path/to/bogus.md) [2](../path/to/bogus.md#with-hash) [3](/path/to/bogus.md#with-hash)
[4](/packages/gasket-fake/bogus.md#with-hash)
[5](/packages/not-gasket/bogus.md#with-hash)
[6](https://github.com/godaddy/gasket/tree/canary/packages/gasket-fake/path/to/bogus.md#with-hash)
[7](https://bogus.gasket.dev)
`);
    });

    it('transforms reference links', () => {
      const results = makeLinkTransform(link => link.replace('doc', 'bogus'))(mockReferenceStyle);
      expect(results).toEqual(`
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
      expect(results).toEqual(mockReferenceStyle);
    });
  });

  describe('txGasketPackageLinks', () => {
    const { test, handler } = txGasketPackageLinks;

    it('is global', () => {
      expect(txGasketPackageLinks).toHaveProperty('global', true);
    });

    describe('test', () => {
      it('matches @gasket node_modules markdown files', () => {
        [
          '/path/to/node_modules/@gasket/plugin-some/README.md',
          '/path/to/node_modules/@gasket/something/README.md',
          '/path/to/node_modules/@gasket/plugin-other/README.md'
        ].forEach(source => {
          expect(test.test(source)).toEqual(true, `Path ${source}`);
        });
      });

      it('matches linked gasket repo package markdown files', () => {
        [
          '/path/to/packages/gasket-plugin-some/README.md',
          '/path/to/packages/gasket-something/README.md',
          '/path/to/packages/gasket-plugin-other/README.md'
        ].forEach(source => {
          expect(test.test(source)).toEqual(true, `Path ${source}`);
        });
      });

      it('does not match non-markdown files', () => {
        [
          '/path/to/node_modules/@gasket/plugin-some/bogus.svg',
          '/path/to/node_modules/@gasket/something/bogus.png',
          '/path/to/node_modules/@gasket/plugin-other/bogus.txt',
          '/path/to/packages/gasket-plugin-some/bogus.svg',
          '/path/to/packages/gasket-something/bogus.png',
          '/path/to/packages/gasket-plugin-other/bogus.txt'
        ].forEach(source => {
          expect(test.test(source)).toEqual(false, `Path ${source}`);
        });
      });

      it('does not match non-@gasket files', () => {
        [
          '/path/to/node_modules/@some/cool-gasket-plugin/README.md',
          '/path/to/node_modules/@gasketz/something/README.md',
          '/path/to/node_modules/@some/cool-gasket-module/README.md',
          '/path/to/my/cool-gasket-plugin/README.md',
          '/path/to/my/gasket/gasket-something/README.md',
          '/path/to/my/cool-gasket-module/README.md'
        ].forEach(source => {
          expect(test.test(source)).toEqual(false, `Path ${source}`);
        });
      });
    });

    describe('handler', () => {
      let mockDocsConfig;

      beforeEach(() => {
        mockDocsConfig = { name: '@gasket/fake' };
      });

      it('is named', () => {
        expect(handler).toHaveProperty('name', 'txGasketPackageLinks');
      });

      it('transforms absolute links under gasket repo to be URLs', () => {
        const results = handler(mockInlineStyle, { docsConfig: mockDocsConfig });
        expect(results).not.toEqual(mockInlineStyle);
        expect(results).not.toContain('[4](/packages/gasket-fake/doc.md#with-hash)');
        expect(results).toContain('[4](https://github.com/godaddy/gasket/tree/main/packages/gasket-fake/doc.md#with-hash)');
      });

      it('does not process if non-@gasket module', () => {
        mockDocsConfig.name = '@not/a-gasket-module';
        const results = handler(mockInlineStyle, { docsConfig: mockDocsConfig });
        expect(results).toEqual(mockInlineStyle);
      });
    });
  });

  describe('txGasketUrlLinks', () => {
    const { test, handler } = txGasketUrlLinks;

    it('is global', () => {
      expect(txGasketUrlLinks).toHaveProperty('global', true);
    });

    describe('test', () => {
      it('matches markdown files', () => {
        [
          'README.md',
          '/path/to/any/README.md'
        ].forEach(source => {
          expect(test.test(source)).toEqual(true, `Path ${source}`);
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
          expect(test.test(source)).toEqual(false, `Path ${source}`);
        });
      });

      describe('handler', () => {
        let docsConfigSet, docsConfig, filename;

        beforeEach(() => {
          docsConfig = { name: '@gasket/plugin-fake', targetRoot: '/path/to/some-app/.docs/plugins/@gasket/plugin-fake' };

          docsConfigSet = {
            plugins: [{ name: '@gasket/plugin-fake', targetRoot: '/path/to/some-app/.docs/plugins/@gasket/plugin-fake' }],
            modules: [{ name: '@gasket/fake', targetRoot: '/path/to/some-app/.docs/modules/@gasket/fake' }],
            docs: '/path/to/some-app',
            docsRoot: '/path/to/some-app/.docs'
          };

          filename = 'README.md';
        });

        it('is named', () => {
          expect(handler).toHaveProperty('name', 'txGasketUrlLinks');
        });

        it('transforms gasket repo URLs to relative links', () => {
          const results = handler(mockInlineStyle, { filename, docsConfig, docsConfigSet });
          expect(results).not.toContain('[6](https://github.com/godaddy/gasket/tree/canary/packages/gasket-fake/path/to/doc.md#with-hash)');
          expect(results).toContain('[6](../../../modules/@gasket/fake/path/to/doc.md#with-hash)');
        });

        it('transforms gasket repo URLs under any branch', () => {
          const mockContent = `
[main](https://github.com/godaddy/gasket/tree/main/packages/gasket-fake/path/to/doc.md#with-hash)
[BOGUS](https://github.com/godaddy/gasket/tree/BOGUS/packages/gasket-fake/path/to/doc.md#with-hash)
[canary-1.7](https://github.com/godaddy/gasket/tree/canary-1.7/packages/gasket-fake/path/to/doc.md#with-hash)
`;
          const results = handler(mockContent, { filename, docsConfig, docsConfigSet });
          expect(results).toContain('[main](../../../modules/@gasket/fake/path/to/doc.md#with-hash)');
          expect(results).toContain('[BOGUS](../../../modules/@gasket/fake/path/to/doc.md#with-hash)');
          expect(results).toContain('[canary-1.7](../../../modules/@gasket/fake/path/to/doc.md#with-hash)');
        });

        it('does not transforms gasket repo URLs if module not collated', () => {
          const mockContent = `[missing](https://github.com/godaddy/gasket/tree/main/packages/gasket-missing/path/to/doc.md#with-hash)`;
          const results = handler(mockContent, { filename, docsConfig, docsConfigSet });
          expect(results).toContain(mockContent);
          expect(results).not.toContain('[missing](../../../modules/@gasket/missing/path/to/doc.md#with-hash)');
        });

        it('does not transform non gasket repo URLs', () => {
          const results = handler(mockInlineStyle, { filename, docsConfig, docsConfigSet });
          expect(results).toContain('[7](https://doc.gasket.dev)');
        });
      });
    });
  });

  describe('txAbsoluteLinks', () => {
    const { test, handler } = txAbsoluteLinks;

    it('is global', () => {
      expect(txAbsoluteLinks).toHaveProperty('global', true);
    });

    describe('test', () => {
      it('matches markdown files', () => {
        [
          'README.md',
          '/path/to/any/README.md'
        ].forEach(source => {
          expect(test.test(source)).toEqual(true, `Path ${source}`);
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
          expect(test.test(source)).toEqual(false, `Path ${source}`);
        });
      });
    });

    describe('handler', () => {
      let docsConfig;

      beforeEach(() => {
        docsConfig = { name: '@gasket/plugin-fake', targetRoot: '/path/to/some-app/.docs/plugins/@gasket/plugin-fake' };
      });

      it('is named', () => {
        expect(handler).toHaveProperty('name', 'txAbsoluteLinks');
      });

      it('transform absolute links to relative', () => {
        const mockContent = `
[1](/path/to/peer-doc.md#with-hash)
[2](/path/to/deep/doc.md#with-hash)
[3](/root-doc.md#with-hash)
`;
        const filename = '/path/to/begin.md';

        const results = handler(mockContent, { filename, docsConfig });
        expect(results).not.toContain(mockContent);
        expect(results).toContain('[1](peer-doc.md#with-hash)');
        expect(results).toContain('[2](deep/doc.md#with-hash)');
        expect(results).toContain('[3](../../root-doc.md#with-hash)');
      });

      it('does not transform relative links', () => {
        const mockContent = `
[1](peer-doc.md#with-hash)
[2](deep/doc.md#with-hash)
[3](../../root-doc.md#with-hash)
`;
        const filename = '/path/to/begin.md';

        const results = handler(mockContent, { filename, docsConfig });
        expect(results).toContain(mockContent);
      });
    });
  });
});
