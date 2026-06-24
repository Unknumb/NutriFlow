import { describe, it, expect, beforeEach } from 'vitest';
import { useClinicalStore } from './useClinicalStore';
import type { PatientData } from './useClinicalStore';

const PESO_FALLBACK = 67.4;

const mockPaciente: PatientData = {
  id: 'pac-1',
  nombre: 'María González',
  edad: 35,
  sexo: 'F',
  talla: 165,
  peso: 72.5,
};

beforeEach(() => {
  localStorage.clear();
  useClinicalStore.setState({
    pesoActivo: PESO_FALLBACK,
    tmbPromedio: 1766,
    activePatient: null,
    activePlanificacionId: null,
  });
});

describe('useClinicalStore — estado inicial', () => {
  it('pesoActivo parte en el valor por defecto', () => {
    expect(useClinicalStore.getState().pesoActivo).toBe(PESO_FALLBACK);
  });

  it('tmbPromedio parte en 1766', () => {
    expect(useClinicalStore.getState().tmbPromedio).toBe(1766);
  });

  it('activePatient y activePlanificacionId parten en null', () => {
    const { activePatient, activePlanificacionId } = useClinicalStore.getState();
    expect(activePatient).toBeNull();
    expect(activePlanificacionId).toBeNull();
  });
});

describe('setActivePatient', () => {
  it('con paciente: asigna activePatient y toma pesoActivo de paciente.peso', () => {
    useClinicalStore.getState().setActivePatient(mockPaciente);
    const { activePatient, pesoActivo } = useClinicalStore.getState();
    expect(activePatient).toEqual(mockPaciente);
    expect(pesoActivo).toBe(mockPaciente.peso);
  });

  it('con null: limpia activePatient y restaura pesoActivo al fallback', () => {
    useClinicalStore.getState().setActivePatient(mockPaciente);
    useClinicalStore.getState().setActivePatient(null);
    const { activePatient, pesoActivo } = useClinicalStore.getState();
    expect(activePatient).toBeNull();
    expect(pesoActivo).toBe(PESO_FALLBACK);
  });

  it('con paciente cuyo peso es 0 (falsy): usa fallback', () => {
    const pacienteSinPeso = { ...mockPaciente, peso: 0 };
    useClinicalStore.getState().setActivePatient(pacienteSinPeso);
    expect(useClinicalStore.getState().pesoActivo).toBe(PESO_FALLBACK);
  });
});

describe('setActivePlanificacionId', () => {
  it('asigna el id correctamente', () => {
    useClinicalStore.getState().setActivePlanificacionId('plan-42');
    expect(useClinicalStore.getState().activePlanificacionId).toBe('plan-42');
  });

  it('acepta null para limpiar la planificación activa', () => {
    useClinicalStore.getState().setActivePlanificacionId('plan-42');
    useClinicalStore.getState().setActivePlanificacionId(null);
    expect(useClinicalStore.getState().activePlanificacionId).toBeNull();
  });
});

describe('setPesoActivo', () => {
  it('actualiza pesoActivo sin tocar el resto del estado', () => {
    useClinicalStore.getState().setActivePatient(mockPaciente);
    useClinicalStore.getState().setPesoActivo(80);
    expect(useClinicalStore.getState().pesoActivo).toBe(80);
    expect(useClinicalStore.getState().activePatient).toEqual(mockPaciente);
  });
});

describe('setTmbPromedio', () => {
  it('actualiza tmbPromedio', () => {
    useClinicalStore.getState().setTmbPromedio(2000);
    expect(useClinicalStore.getState().tmbPromedio).toBe(2000);
  });
});

describe('persist', () => {
  it('usa la clave "clinical-storage" en localStorage', () => {
    useClinicalStore.getState().setPesoActivo(90);
    const guardado = localStorage.getItem('clinical-storage');
    expect(guardado).not.toBeNull();
    expect(JSON.parse(guardado!)).toHaveProperty('state');
  });
});
