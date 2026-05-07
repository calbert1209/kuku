import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "serve" ? "./" : "/kuku/",
  plugins: [preact()],
}));
