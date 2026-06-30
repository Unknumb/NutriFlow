import { describe, it, expect, beforeEach } from 'vitest';
import { useClinicalStore } from './useClinicalStore';
import type { PatientData } from './useClinicalStore';

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
  // Baseline = defaults reales del store: sin valores clínicos fabricados.
  useClinicalStore.setState({
    pesoActivo: 0,
    tmbPromedio: 0,
    activePatient: null,
    activePlanificacionId: null,
  });
});

describe('useClinicalStore — estado inicial', () => {
  it('pesoActivo parte en 0 (sin dato fabricado)', () => {
    expect(useClinicalStore.getState().pesoActivo).toBe(0);
  });

  it('tmbPromedio parte en 0 (la TMB se calcula por paciente, nunca un default)', () => {
    expect(useClinicalStore.getState().tmbPromedio).toBe(0);
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

  it('resetea la TMB a 0 al activar un paciente (evita arrastrar la del anterior)', () => {
    useClinicalStore.getState().setTmbPromedio(1800);
    useClinicalStore.getState().setActivePatient(mockPaciente);
    expect(useClinicalStore.getState().tmbPromedio).toBe(0);
  });

  it('con null: limpia activePatient y deja pesoActivo en 0', () => {
    useClinicalStore.getState().setActivePatient(mockPaciente);
    useClinicalStore.getState().setActivePatient(null);
    const { activePatient, pesoActivo } = useClinicalStore.getState();
    expect(activePatient).toBeNull();
    expect(pesoActivo).toBe(0);
  });

  it('con paciente cuyo peso es 0 (falsy): pesoActivo queda en 0', () => {
    const pacienteSinPeso = { ...mockPaciente, peso: 0 };
    useClinicalStore.getState().setActivePatient(pacienteSinPeso);
    expect(useClinicalStore.getState().pesoActivo).toBe(0);
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
