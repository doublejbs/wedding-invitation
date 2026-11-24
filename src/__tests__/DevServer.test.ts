// @vitest-environment node
import { resolve } from 'node:path';
import { resolveConfig } from 'vite';

describe('vite.config.ts', () => {
  it('serves only the built invitation at the root', async () => {
    const config = await resolveConfig({ mode: 'development' }, 'serve');

    expect(config.root).toBe(resolve(process.cwd(), 'site'));
    // Vite adds its own client folder; the project folder (with .certs.local) must not be there.
    expect(config.server.fs.allow).toContain(resolve(process.cwd(), 'site'));
    expect(config.server.fs.allow).not.toContain(process.cwd());
  });
});
