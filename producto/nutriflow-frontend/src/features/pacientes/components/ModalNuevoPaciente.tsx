// nutriflow-frontend/src/features/pacientes/components/ModalNuevoPaciente.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, X } from 'lucide-react';
import { useCreatePaciente } from '../hooks/usePacientes';
import type { CreatePacientePayload } from '../types/paciente.types';
import { ChipsInput } from './ChipsInput';
import { esRutValido, formatearRutInput, normalizarRut } from '../utils/rut';
import { obtenerMensajeErrorApi } from '../utils/apiError';

interface ModalNuevoPacienteProps {
  isOpen: boolean;
  onClose: () => void;
  /** Se invoca con el id del paciente recién creado. */
  onCreated?: (pacienteId: string) => void;
}

interface FormState {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  sexo_biologico: string;
  rut: string;
  email: string;
  telefono: string;
  ocupacion: string;
  direccion: string;
  talla_cm: string;
  peso_kg: string;
  enfermedades: string[];
  alergias: string[];
  preferencias_alimentarias: string[];
  notas_preferencias: string;
}

const FORM_INICIAL: FormState = {
  nombre: '',
  apellido: '',
  fecha_nacimiento: '',
  sexo_biologico: '',
  rut: '',
  email: '',
  telefono: '',
  ocupacion: '',
  direccion: '',
  talla_cm: '',
  peso_kg: '',
  enfermedades: [],
  alergias: [],
  preferencias_alimentarias: [],
  notas_preferencias: '',
};

const inputClass =
  'w-full border border-mist rounded-lg px-3 py-2 text-sm outline-none focus:border-pine-soft focus:ring-1 focus:ring-pine-soft transition-colors';
const labelClass = 'block text-sm font-medium text-ink-soft mb-1';

export const ModalNuevoPaciente: React.FC<ModalNuevoPacienteProps> = ({ isOpen, onClose, onCreated }) => {
  const createPaciente = useCreatePaciente();
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const rutInvalido = form.rut.trim() !== '' && !esRutValido(form.rut);
  const camposObligatoriosOk =
    form.nombre.trim() && form.apellido.trim() && form.fecha_nacimiento && form.talla_cm && form.peso_kg;
  const puedeGuardar = Boolean(camposObligatoriosOk) && !rutInvalido && !createPaciente.isPending;

  const handleClose = () => {
    setForm(FORM_INICIAL);
    setErrorMsg(null);
    onClose();
  };

  const handleGuardar = async () => {
    if (!puedeGuardar) return;
    setErrorMsg(null);

    const payload: CreatePacientePayload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      fecha_nacimiento: form.fecha_nacimiento,
      sexo_biologico: form.sexo_biologico || undefined,
      rut: form.rut.trim() ? normalizarRut(form.rut) : undefined,
      email: form.email.trim() || undefined,
      telefono: form.telefono.trim() || undefined,
      ocupacion: form.ocupacion.trim() || undefined,
      direccion: form.direccion.trim() || undefined,
      enfermedades: form.enfermedades,
      alergias: form.alergias,
      preferencias_alimentarias: form.preferencias_alimentarias,
      notas_preferencias: form.notas_preferencias.trim() || undefined,
      talla_cm: Number(form.talla_cm),
      peso_kg: Number(form.peso_kg),
    };

    try {
      const nuevoPaciente = await createPaciente.mutateAsync(payload);
      setForm(FORM_INICIAL);
      onCreated?.(nuevoPaciente.id);
      onClose();
    } catch (error: unknown) {
      setErrorMsg(obtenerMensajeErrorApi(error, 'No se pudo crear el paciente. Intenta nuevamente.'));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-card shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-mist/70">
          <div>
            <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-pine-soft" />
              Nuevo Paciente
            </h2>
            <p className="text-sm text-ink-soft mt-1">Registra la ficha del paciente con sus datos de contacto y salud</p>
          </div>
          <button onClick={handleClose} className="p-2 text-ink-soft/60 hover:text-ink-soft hover:bg-mist/60 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Datos personales */}
          <section>
            <h3 className="text-sm font-semibold text-ink mb-3">Datos personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input type="text" className={inputClass} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Juan" />
              </div>
              <div>
                <label className={labelClass}>Apellido *</label>
                <input type="text" className={inputClass} value={form.apellido} onChange={e => set('apellido', e.target.value)} placeholder="Ej: Pérez" />
              </div>
              <div>
                <label className={labelClass}>RUT</label>
                <input
                  type="text"
                  className={`${inputClass} ${rutInvalido ? 'border-clinical-red/60 focus:border-clinical-red focus:ring-clinical-red' : ''}`}
                  value={form.rut}
                  onChange={e => set('rut', formatearRutInput(e.target.value))}
                  placeholder="12.345.678-9"
                />
                {rutInvalido && <p className="text-xs text-clinical-red mt-1">RUT inválido: verifica el dígito verificador</p>}
              </div>
              <div>
                <label className={labelClass}>Fecha de nacimiento *</label>
                <input type="date" className={inputClass} value={form.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Sexo biológico</label>
                <select className={`${inputClass} bg-white`} value={form.sexo_biologico} onChange={e => set('sexo_biologico', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Ocupación</label>
                <input type="text" className={inputClass} value={form.ocupacion} onChange={e => set('ocupacion', e.target.value)} placeholder="Ej: Profesora" />
              </div>
              <div>
                <label className={labelClass}>Correo electrónico</label>
                <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} placeholder="paciente@correo.com" />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input type="tel" className={inputClass} value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+56 9 1234 5678" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Dirección</label>
                <input type="text" className={inputClass} value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Av. Providencia 1234, Santiago" />
              </div>
            </div>
          </section>

          {/* Datos antropométricos iniciales */}
          <section>
            <h3 className="text-sm font-semibold text-ink mb-3">Evaluación inicial</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Talla inicial (cm) *</label>
                <input type="number" step="0.1" min="0" className={inputClass} value={form.talla_cm} onChange={e => set('talla_cm', e.target.value)} placeholder="170" />
              </div>
              <div>
                <label className={labelClass}>Peso inicial (kg) *</label>
                <input type="number" step="0.1" min="0" className={inputClass} value={form.peso_kg} onChange={e => set('peso_kg', e.target.value)} placeholder="70" />
              </div>
            </div>
          </section>

          {/* Salud y preferencias */}
          <section className="p-4 bg-porcelain rounded-card border border-mist space-y-4">
            <h3 className="text-sm font-semibold text-ink">Salud y preferencias</h3>
            <ChipsInput
              label="Enfermedades / condiciones"
              values={form.enfermedades}
              onChange={v => set('enfermedades', v)}
              placeholder="Ej: Diabetes tipo 2 (Enter para agregar)"
              chipClassName="bg-clinical-red/5 text-clinical-red border-clinical-red/30"
            />
            <ChipsInput
              label="Alergias alimentarias"
              values={form.alergias}
              onChange={v => set('alergias', v)}
              placeholder="Ej: Maní (Enter para agregar)"
              chipClassName="bg-apricot/10 text-[#8a5a2a] border-apricot/50"
            />
            <ChipsInput
              label="Preferencias alimentarias"
              values={form.preferencias_alimentarias}
              onChange={v => set('preferencias_alimentarias', v)}
              placeholder="Ej: Vegetariano (Enter para agregar)"
              chipClassName="bg-pine-soft/5 text-pine-soft border-pine-soft/30"
            />
            <div>
              <label className={labelClass}>Notas sobre salud y preferencias</label>
              <textarea
                className={`${inputClass} min-h-20 resize-none`}
                value={form.notas_preferencias}
                onChange={e => set('notas_preferencias', e.target.value)}
                placeholder="Ej: Prefiere comidas sin picante. Cena temprano."
              />
            </div>
          </section>

          {errorMsg && (
            <div className="p-3 bg-clinical-red/5 border border-clinical-red/30 rounded-lg text-sm text-clinical-red">{errorMsg}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-mist/70">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-ink-soft bg-white border border-mist rounded-lg hover:bg-porcelain transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!puedeGuardar}
            className="px-4 py-2 text-sm font-medium text-white bg-pine rounded-lg hover:bg-pine-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createPaciente.isPending ? 'Guardando...' : 'Guardar Paciente'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
