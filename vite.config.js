import lodash from 'lodash'
import { viteConfig } from './scripts/vite/index'
import { defineConfig } from 'vite';

export default defineConfig((ctx) => lodash.merge(viteConfig(ctx), {
}))