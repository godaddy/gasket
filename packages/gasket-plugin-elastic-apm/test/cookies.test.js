const { filterSensitiveCookies, sensitiveCookies } = require('../lib/cookies');

describe('filterSensitiveCookies', () => {
  it('is a thunk', () => {
    expect(typeof filterSensitiveCookies).toStrictEqual('function');
    expect(typeof filterSensitiveCookies({})).toStrictEqual('function');
  });

  it('handles payloads without request context', () => {
    const samplePayload = { context: {} };

    expect(filterSensitiveCookies({})(samplePayload)).toStrictEqual(
      samplePayload
    );
  });

  it('redacts sensitive cookies from both cookies and header cookies', () => {
    const samplePayload = {
      context: {
        request: {
          headers: {
            cookie: 'secret=foo; alsosecret=bar'
          },
          cookies: {
            secret: 'foo',
            cust_idp: 'bar'
          }
        }
      }
    };

    const filtered = filterSensitiveCookies({
      elasticAPM: { sensitiveCookies: ['secret', 'alsosecret'] }
    })(samplePayload);

    expect(filtered.context.request.headers.cookie).toStrictEqual('secret=[REDACTED]; alsosecret=[REDACTED]');
    expect(filtered.context.request.cookies).toStrictEqual({ secret: '[REDACTED]', cust_idp: 'bar' });
  });
});

describe('sensitiveCookies', () => {
  it('returns config.elasticAPM.sensitiveCookies if present', () => {
    expect(
      sensitiveCookies({ elasticAPM: { sensitiveCookies: ['foo', 'bar'] } })
    ).toStrictEqual(['foo', 'bar']);
  });

  it('returns an empty array by default', () => {
    expect(sensitiveCookies({})).toStrictEqual([]);
  });
});
