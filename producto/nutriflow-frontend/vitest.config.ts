// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // Quita esto si usas Vue o Svelte

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Simula el navegador
    globals: true,        // Permite usar describe/it/expect sin importarlos siempre
    setupFiles: ['./vitest.setup.ts'], // Carga jest-dom
    include: ['src/**/*.spec.{ts,tsx}'], // Busca específicamente archivos .spec
  },
});