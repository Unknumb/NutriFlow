import { describe, it, expect } from 'vitest';
import { derivarRestriccionesDePaciente } from './restricciones';

describe('derivarRestriccionesDePaciente', () => {
  it('detecta "vegano" directamente', () => {
    expect(derivarRestriccionesDePaciente(['vegano'])).toContain('vegano');
  });

  it('detecta "vegetariano"', () => {
    expect(derivarRestriccionesDePaciente(['vegetariano'])).toContain('vegetariano');
  });

  it('normaliza diacríticos: "celíaco" → sin_gluten', () => {
    expect(derivarRestriccionesDePaciente(['celíaco'])).toContain('sin_gluten');
  });

  it('normaliza diacríticos: "intolerancia a la lactosa" → sin_lactosa', () => {
    expect(derivarRestriccionesDePaciente(['intolerancia a la lactosa'])).toContain('sin_lactosa');
  });

  it('normaliza diacríticos: "alergia a los lácteos" → sin_lactosa', () => {
    expect(derivarRestriccionesDePaciente(['alergia a los lácteos'])).toContain('sin_lactosa');
  });

  it('detecta en mayúsculas (case-insensitive)', () => {
    expect(derivarRestriccionesDePaciente(['VEGANO'])).toContain('vegano');
  });

  it('deduplica: la misma restricción mencionada dos veces aparece solo una vez', () => {
    const resultado = derivarRestriccionesDePaciente(['vegano', 'dieta vegana']);
    expect(resultado.filter((r) => r === 'vegano')).toHaveLength(1);
  });

  it('detecta múltiples restricciones en textos separados', () => {
    const resultado = derivarRestriccionesDePaciente(['vegetariano', 'alergia a los mariscos']);
    expect(resultado).toContain('vegetariano');
    expect(resultado).toContain('sin_mariscos');
  });

  it('detecta múltiples keywords en un mismo texto', () => {
    const resultado = derivarRestriccionesDePaciente(['vegano y sin gluten']);
    expect(resultado).toContain('vegano');
    expect(resultado).toContain('sin_gluten');
  });

  it('retorna array vacío para textos vacíos', () => {
    expect(derivarRestriccionesDePaciente(['', '   '])).toEqual([]);
  });

  it('retorna array vacío para array vacío', () => {
    expect(derivarRestriccionesDePaciente([])).toEqual([]);
  });

  it('retorna array vacío cuando no hay keywords reconocidas', () => {
    expect(derivarRestriccionesDePaciente(['come de todo'])).toEqual([]);
  });

  it('detecta "diabético" → sin_azucar', () => {
    expect(derivarRestriccionesDePaciente(['diabético tipo 2'])).toContain('sin_azucar');
  });

  it('detecta "hipertensión" → bajo_sodio', () => {
    expect(derivarRestriccionesDePaciente(['hipertensión arterial'])).toContain('bajo_sodio');
  });

  it('detecta "alergia a los frutos secos"', () => {
    expect(derivarRestriccionesDePaciente(['alergia a los frutos secos'])).toContain('sin_frutos_secos');
  });

  it('detecta "alergia al huevo"', () => {
    expect(derivarRestriccionesDePaciente(['no consume huevo'])).toContain('sin_huevo');
  });

  it('detecta "cerdo" y "chancho"', () => {
    expect(derivarRestriccionesDePaciente(['no come cerdo'])).toContain('sin_cerdo');
    expect(derivarRestriccionesDePaciente(['no come chancho'])).toContain('sin_cerdo');
  });
});
