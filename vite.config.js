import { defineConfig } from 'vite';
import string from 'vite-plugin-string';

export default defineConfig({
  plugins: [
    string({
      // Optional: specify file types you want to load as strings
      include: '**/*.html', 
    }),
  ],
});
