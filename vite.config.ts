import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
// vite-plugin-cesium è distribuito come CommonJS; il cast è necessario con module:nodenext
import cesiumImport from 'vite-plugin-cesium';
const cesium = cesiumImport as unknown as () => Plugin;

// In GitHub Actions, GITHUB_REPOSITORY è "owner/repo-name" (automatico).
// Localmente non è definito, quindi base rimane '/'.
const ghRepo   = process.env.GITHUB_REPOSITORY ?? '';
const repoName = ghRepo.includes('/') ? ghRepo.split('/')[1] : '';
const base      = repoName ? `/${repoName}/` : '/';

export default defineConfig({
  base,
  plugins: [react(), cesium()],
  // vite-plugin-cesium imposta CESIUM_BASE_URL='/cesium/' (senza il prefisso base).
  // Lo sovrascriviamo per GitHub Pages dove i file si trovano a /<repo>/cesium/.
  define: {
    CESIUM_BASE_URL: JSON.stringify(`${base}cesium/`),
    __BUILD_TIME__:  JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')),
  },
});
