import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps asset URLs relative so the built site works from any
// GitHub Pages subpath (e.g. kirax-12.github.io/remike-analytics-react/).
// outDir 'site' puts the deployable payload in site/, separate from source.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'site',
    emptyOutDir: true,
  },
})
