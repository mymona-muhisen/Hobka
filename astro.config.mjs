// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://hobka.mhmymona.workers.dev',
  // Pages are static by default; order API, draft review and admin opt into on-demand rendering.
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  trailingSlash: 'ignore',
  build: { format: 'file' },
});
