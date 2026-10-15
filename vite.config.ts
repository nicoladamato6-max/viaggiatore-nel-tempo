import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
// vite-plugin-cesium è distribuito come CommonJS; il cast è necessario con module:nodenext
import cesiumImport from 'vite-plugin-cesium';
const cesium = cesiumImport as unknown as () => Plugin;

export default defineConfig({
  base: '/',
  plugins: [react(), cesium()],
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium/'),
  },
  server: {
    proxy: {
      '/awmc': {
        target: 'https://cawm.lib.uiowa.edu',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/awmc/, '/tiles'),
      },
      '/gplates': {
        target: 'https://gws.gplates.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/gplates/, '/reconstruct/coastlines'),
      },
    },
  },
});
