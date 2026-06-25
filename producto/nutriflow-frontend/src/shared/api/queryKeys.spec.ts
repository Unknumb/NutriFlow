import { describe, it, expect } from 'vitest';
import {
  dashboardKeys,
  pacientesKeys,
  evaluacionesKeys,
  pautasKeys,
  menusKeys,
  perfilKeys,
  preparacionesKeys,
  alimentosKeys,
} from './queryKeys';

describe('dashboardKeys', () => {
  it('all = ["dashboard"]', () => {
    expect(dashboardKeys.all).toEqual(['dashboard']);
  });
  it('calculos incluye all + "calculos" + pacienteId', () => {
    expect(dashboardKeys.calculos('p1')).toEqual(['dashboard', 'calculos', 'p1']);
  });
});

describe('pacientesKeys', () => {
  it('all = ["pacientes"]', () => {
    expect(pacientesKeys.all).toEqual(['pacientes']);
  });
  it('detail incluye all + id', () => {
    expect(pacientesKeys.detail('p1')).toEqual(['pacientes', 'p1']);
  });
  it('evaluaciones incluye detail + "evaluaciones"', () => {
    expect(pacientesKeys.evaluaciones('p1')).toEqual(['pacientes', 'p1', 'evaluaciones']);
  });
  it('pautas incluye detail + "pautas"', () => {
    expect(pacientesKeys.pautas('p1')).toEqual(['pacientes', 'p1', 'pautas']);
  });
});

describe('evaluacionesKeys', () => {
  it('all = ["evaluaciones"]', () => {
    expect(evaluacionesKeys.all).toEqual(['evaluaciones']);
  });
  it('detail incluye all + id', () => {
    expect(evaluacionesKeys.detail('e1')).toEqual(['evaluaciones', 'e1']);
  });
});

describe('pautasKeys', () => {
  it('all = ["pautas"]', () => {
    expect(pautasKeys.all).toEqual(['pautas']);
  });
  it('detail incluye all + id', () => {
    expect(pautasKeys.detail('pau1')).toEqual(['pautas', 'pau1']);
  });
});

describe('menusKeys', () => {
  it('all = ["menus"]', () => {
    expect(menusKeys.all).toEqual(['menus']);
  });
});

describe('perfilKeys', () => {
  it('all = ["perfil"]', () => {
    expect(perfilKeys.all).toEqual(['perfil']);
  });
});

describe('preparacionesKeys', () => {
  it('all = ["preparaciones"]', () => {
    expect(preparacionesKeys.all).toEqual(['preparaciones']);
  });
});

describe('alimentosKeys', () => {
  it('all = ["alimentos"]', () => {
    expect(alimentosKeys.all).toEqual(['alimentos']);
  });
  it('busqueda incluye all + "busqueda" + search + categoria', () => {
    expect(alimentosKeys.busqueda('pollo', 'carnes')).toEqual(['alimentos', 'busqueda', 'pollo', 'carnes']);
  });
  it('busqueda acepta categoria null', () => {
    expect(alimentosKeys.busqueda('manzana', null)).toEqual(['alimentos', 'busqueda', 'manzana', null]);
  });
  it('categorias incluye all + "categorias"', () => {
    expect(alimentosKeys.categorias()).toEqual(['alimentos', 'categorias']);
  });
});
