const assume = require('assume');
const docsSetup = require('../lib/docs-setup')();

describe('docsSetup', () => {
  const { global, test, handler } = docsSetup.transforms[0];
  let mockContent;

  beforeEach(() => {
    mockContent = {
      licenseRef: `./LICENSE.md`,
      docsDirectoryRef: '/docs/configuration.md',
      readmeRef: `/README.md`,
      pathTraversalRef: {
        single: '../',
        double: '../../',
        triple: '../../../',
        quadruple: '../../../../',
        random: new Array(Math.ceil(Math.random() * 10)).fill('../').join('')
      }
    };
  });

  it('global is defined and set to "true"', function () {
    assume(global)
      .exists()
      .equals(true);
  });

  it('transform should apply to markdown files', function () {
    const challenge = 'README.md'.match(test);
    assume(challenge).is.not.falsey();
    assume(challenge).is.a('array');
    assume(challenge.length).equals(1);
  });

  it('replaces "/docs/" references containing ".md" extension', function () {
    assume(handler(mockContent.docsDirectoryRef)).equals('./configuration');
  });

  it('does not replace "/docs/" references missing ".md" extension', function () {
    assume(handler('/docs/test.js')).equals('/docs/test.js');
    assume(handler('/docs/favicon.ico')).equals('/docs/favicon.ico');
    assume(handler('/docs/index.html')).equals('/docs/index.html');
  });

  it('replaces file path /LICENSE.md references', function () {
    assume(handler(mockContent.licenseRef)).equals('/LICENSE');
  });

  it('removes file path /README.md references', function () {
    assume(handler(mockContent.readmeRef)).equals('');
  });

  it('replaces path traversal references with "/"', function () {
    const {
      single,
      double,
      triple,
      quadruple,
      random
    } = mockContent.pathTraversalRef;
    assume(handler(single)).equals('/');
    assume(handler(double)).equals('/');
    assume(handler(triple)).equals('/');
    assume(handler(quadruple)).equals('/');
    assume(handler(random)).equals('/');
  });
});
