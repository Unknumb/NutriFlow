import { describe, it, expect } from 'vitest';
import { MEALS, todasLasComidas, resolverComida, comidasOrdenadas } from './constants';
import type { ComidaDef } from './constants';

const CUSTOM: ComidaDef[] = [
  { id: 'merienda', name: 'Merienda', time: '15:00' },
  { id: 'pre_entreno', name: 'Pre entreno', time: '' },
];

describe('todasLasComidas', () => {
  it('sin args devuelve exactamente las comidas predefinidas', () => {
    expect(todasLasComidas()).toEqual(MEALS);
  });

  it('con customMeals las añade al final de MEALS', () => {
    const resultado = todasLasComidas(CUSTOM);
    expect(resultado).toHaveLength(MEALS.length + CUSTOM.length);
    expect(resultado.slice(MEALS.length)).toEqual(CUSTOM);
  });

  it('no muta el arreglo MEALS original', () => {
    const longitudOriginal = MEALS.length;
    todasLasComidas(CUSTOM);
    expect(MEALS).toHaveLength(longitudOriginal);
  });
});

describe('resolverComida', () => {
  it('devuelve datos correctos de una comida predefinida', () => {
    const comida = resolverComida('desayuno');
    expect(comida).toEqual({ id: 'desayuno', name: 'Desayuno', time: '07:00' });
  });

  it('encuentra comida en customMeals si no está en MEALS', () => {
    const comida = resolverComida('merienda', CUSTOM);
    expect(comida).toEqual({ id: 'merienda', name: 'Merienda', time: '15:00' });
  });

  it('formatea el nombre de un id desconocido: capitaliza y reemplaza guiones', () => {
    const comida = resolverComida('segunda_cena');
    expect(comida.name).toBe('Segunda cena');
    expect(comida.id).toBe('segunda_cena');
  });

  it('aplica el override de mealTimes sobre la hora base', () => {
    const comida = resolverComida('almuerzo', [], { almuerzo: '14:30' });
    expect(comida.time).toBe('14:30');
    expect(comida.name).toBe('Almuerzo');
  });

  it('sin time en customMeals ni override, time queda en string vacío', () => {
    const comida = resolverComida('pre_entreno', CUSTOM);
    expect(comida.time).toBe('');
  });
});

describe('comidasOrdenadas', () => {
  it('ordena por hora HH:MM de menor a mayor', () => {
    const ids = ['cena', 'desayuno', 'almuerzo'];
    const resultado = comidasOrdenadas(ids);
    expect(resultado.map((c) => c.id)).toEqual(['desayuno', 'almuerzo', 'cena']);
  });

  it('las comidas sin hora van al final', () => {
    const resultado = comidasOrdenadas(['cena', 'pre_entreno', 'desayuno'], CUSTOM);
    const ultimoId = resultado[resultado.length - 1].id;
    expect(ultimoId).toBe('pre_entreno');
  });

  it('aplica overrides de mealTimes antes de ordenar', () => {
    // desayuno normal es 07:00; si se sobreescribe a 22:00 debe quedar al final
    const resultado = comidasOrdenadas(['desayuno', 'almuerzo'], [], { desayuno: '22:00' });
    expect(resultado[0].id).toBe('almuerzo');
    expect(resultado[1].id).toBe('desayuno');
  });

  it('con array vacío retorna array vacío', () => {
    expect(comidasOrdenadas([])).toEqual([]);
  });
});
