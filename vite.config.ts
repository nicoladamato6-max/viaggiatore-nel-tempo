import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';

// In GitHub Actions, GITHUB_REPOSITORY è "owner/repo-name" (automatico).
// Localmente non è definito, quindi base rimane '/'.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base      = repoName ? `/${repoName}/` : '/';

export default defineConfig({
  base,
  plugins: [react(), cesium()],
});
