import { describe, it, expect, afterEach } from 'vitest';
import { createExpressAdapter } from '../lib/adapters/index.js';

describe('createExpressAdapter (installed Express)', () => {
  let server;

  afterEach(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    server = null;
  });

  it('creates a working app on the installed Express major', async () => {
    const app = createExpressAdapter().createInstance({});
    app.get('/', (req, res) => res.send(`hello ${req.cookies.a}`));
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));

    const res = await fetch(`http://127.0.0.1:${server.address().port}/`, {
      headers: { cookie: 'a=1' }
    });

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('hello 1');
  });
});
