import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const SITE_DIR = resolve(import.meta.dirname, 'site');

const STUDIES_DIR = resolve(import.meta.dirname, 'docs/cover-studies');

// The build writes this one, so a change to it must not start another build.
const MERGED_PAGE = resolve(STUDIES_DIR, 'Invitation.html');

const BUILD_SCRIPT = resolve(import.meta.dirname, 'scripts/BuildSite.py');

const MERGE_SCRIPT = resolve(import.meta.dirname, 'scripts/BuildInvitation.py');

const CERT_FILE = resolve(import.meta.dirname, '.certs.local/cert.pem');

const KEY_FILE = resolve(import.meta.dirname, '.certs.local/key.pem');

const buildSite = () => {
  try {
    execFileSync('python3', [BUILD_SCRIPT], { stdio: 'inherit' });
  } catch {
    // Python already printed the reason; the server stays up until the source is fixed.
  }
};

const createInvitationPlugin = (): Plugin => {
  return {
    name: 'invitation',
    configureServer: (server) => {
      const handleFileEvent = (_event: string, path: string) => {
        const isStudy = path.startsWith(`${STUDIES_DIR}${sep}`) && path !== MERGED_PAGE;

        if (!isStudy && path !== BUILD_SCRIPT && path !== MERGE_SCRIPT) {
          return;
        }

        buildSite();
        server.ws.send({ type: 'full-reload' });
      };

      buildSite();
      server.watcher.add([STUDIES_DIR, BUILD_SCRIPT, MERGE_SCRIPT]);
      server.watcher.on('all', (event, path) => {
        if (event === 'change' || event === 'unlink') {
          handleFileEvent(event, path);
        }
      });
    },
  };
};

export default defineConfig(({ mode }) => {
  if (mode === 'test') {
    return { test: { environment: 'jsdom', globals: true, css: false } };
  }

  const https = existsSync(CERT_FILE) && existsSync(KEY_FILE) ? { cert: CERT_FILE, key: KEY_FILE } : undefined;

  return {
    root: SITE_DIR,
    publicDir: false,
    // site/ is deleted on every build, so the cache lives outside it.
    cacheDir: resolve(import.meta.dirname, 'node_modules/.vite'),
    plugins: [createInvitationPlugin()],
    server: { https, fs: { allow: [SITE_DIR] } },
  };
});
