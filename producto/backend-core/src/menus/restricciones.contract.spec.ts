// backend-core/src/menus/restricciones.contract.spec.ts
//
// Test de contrato: el vocabulario de restricciones dietéticas vive copiado en
// tres módulos (frontend, backend-core, backend-math) con la instrucción
// "MANTENER SINCRONIZADO". Este spec falla si alguna copia se desalinea,
// convirtiendo el desfase silencioso en un rojo de CI.
import { readFileSync } from 'fs';
import { join } from 'path';
import { RESTRICCIONES_DIETETICAS } from './restricciones.constants';

const RAIZ_PRODUCTO = join(__dirname, '..', '..', '..');

/** Extrae los strings de una lista delimitada en un archivo fuente ajeno. */
function extraerVocabulario(contenido: string, inicio: RegExp): string[] {
  const desde = contenido.search(inicio);
  if (desde === -1) return [];
  const bloque = contenido.slice(desde, contenido.indexOf(']', desde) + 1);
  return [...bloque.matchAll(/["']([a-z_]+)["']/g)].map((m) => m[1]);
}

describe('Contrato: vocabulario de restricciones dietéticas', () => {
  const esperado = [...RESTRICCIONES_DIETETICAS].sort();

  it('coincide con la copia del frontend (restricciones.ts)', () => {
    const ruta = join(
      RAIZ_PRODUCTO,
      'nutriflow-frontend',
      'src',
      'features',
      'generador',
      'constants',
      'restricciones.ts',
    );
    const contenido = readFileSync(ruta, 'utf8');
    const vocabulario = extraerVocabulario(
      contenido,
      /export const RESTRICCIONES_DIETETICAS = \[/,
    );
    expect(vocabulario.sort()).toEqual(esperado);
  });

  it('coincide con la copia de backend-math (restricciones.py)', () => {
    const ruta = join(
      RAIZ_PRODUCTO,
      'backend-math',
      'core',
      'restricciones.py',
    );
    const contenido = readFileSync(ruta, 'utf8');
    // En Python es un frozenset({...}): mismo principio, otro delimitador.
    const desde = contenido.search(/RESTRICCIONES_DIETETICAS = frozenset\(/);
    expect(desde).toBeGreaterThanOrEqual(0);
    const bloque = contenido.slice(desde, contenido.indexOf(')', desde) + 1);
    const vocabulario = [...bloque.matchAll(/"([a-z_]+)"/g)].map((m) => m[1]);
    expect(vocabulario.sort()).toEqual(esperado);
  });
});
