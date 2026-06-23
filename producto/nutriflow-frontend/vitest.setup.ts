// vitest.setup.ts
import '@testing-library/jest-dom'; 
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Esto limpia el "DOM virtual" después de cada prueba para que no choquen entre sí
afterEach(() => {
  cleanup();
});