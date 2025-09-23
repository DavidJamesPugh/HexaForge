import { defineConfig } from 'vite';
import string from 'vite-plugin-string';

export default defineConfig({
  plugins: [
    string({
      // Only transform template HTML files, never the app entry index.html
      include: ['js/template/**/*.html'],
      exclude: ['index.html'],
    }),
  ],
});
