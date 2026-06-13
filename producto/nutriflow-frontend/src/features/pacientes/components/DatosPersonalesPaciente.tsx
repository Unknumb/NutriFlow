// nutriflow-frontend/src/features/pacientes/components/DatosPersonalesPaciente.tsx
import React, { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import type { Paciente, UpdatePacientePayload } from '../types/paciente.types';
import { useUpdatePaciente } from '../hooks/usePacientes';
import { ChipsInput } from './ChipsInput';
import { esRutValido, formatearRutInput, normalizarRut } from '../utils/rut';
import { obtenerMensajeErrorApi } from '../utils/apiError';

interface DatosPersonalesPacienteProps {
  paciente: Paciente;
}

interface EditState {
  rut: string;
  email: string;
  telefono: string;
  ocupacion: string;
  direccion: string;
  enfermedades: string[];
  alergias: string[];
  preferencias_alimentarias: string[];
  notas_preferencias: string;
}

const inputClass =
  'w-full border border-mist rounded-lg px-3 py-2 text-sm outline-none focus:border-pine-soft focus:ring-1 focus:ring-pine-soft transition-colors';
const labelClass = 'block text-xs font-medium text-ink-soft mb-1';

const CampoLectura: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-ink-soft mb-0.5">{label}</p>
    <p className={`text-sm font-medium ${value ? 'text-ink' : 'text-ink-soft/60'}`}>{value || 'No registrado'}</p>
  </div>
);

const ListaChipsLectura: React.FC<{ label: string; values: string[]; chipClassName: string }> = ({ label, values, chipClassName }) => (
  <div>
    <p className="text-xs text-ink-soft mb-1">{label}</p>
    {values.length === 0 ? (
      <p className="text-sm text-ink-soft/60">Sin registros</p>
    ) : (
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span key={`${v}-${i}`} className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${chipClassName}`}>
            {v}
          </span>
        ))}
      </div>
    )}
  </div>
);

/**
 * Ficha de datos personales y de salud del paciente, con modo edición inline.
 * Persiste vía PATCH /pacientes/:id (useUpdatePaciente).
 */
export const DatosPersonalesPaciente: React.FC<DatosPersonalesPacienteProps> = ({ paciente }) => {
  const updatePaciente = useUpdatePaciente();
  const [editando, setEditando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState<EditState>(() => construirEstado(paciente));

  function construirEstado(p: Paciente): EditState {
    return {
      rut: p.rut ? formatearRutInput(p.rut) : '',
      email: p.email || '',
      telefono: p.telefono || '',
      ocupacion: p.ocupacion || '',
      direccion: p.direccion || '',
      enfermedades: p.enfermedades || [],
      alergias: p.alergias || [],
      preferencias_alimentarias: p.preferencias_alimentarias || [],
      notas_preferencias: p.notas_preferencias || '',
    };
  }

  const set = <K extends keyof EditState>(key: K, value: EditState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const rutInvalido = form.rut.trim() !== '' && !esRutValido(form.rut);

  const iniciarEdicion = () => {
    setForm(construirEstado(paciente));
    setErrorMsg(null);
    setEditando(true);
  };

  const handleGuardar = () => {
    if (rutInvalido || updatePaciente.isPending) return;
    setErrorMsg(null);

    // null = limpiar el campo en el backend; un valor presente lo actualiza
    const payload: UpdatePacientePayload = {
      rut: form.rut.trim() ? normalizarRut(form.rut) : null,
      email: form.email.trim() || null,
      telefono: form.telefono.trim() || null,
      ocupacion: form.ocupacion.trim() || null,
      direccion: form.direccion.trim() || null,
      enfermedades: form.enfermedades,
      alergias: form.alergias,
      preferencias_alimentarias: form.preferencias_alimentarias,
      notas_preferencias: form.notas_preferencias.trim() || null,
    };

    updatePaciente.mutate(
      { id: paciente.id, payload },
      {
        onSuccess: () => setEditando(false),
        onError: (error: unknown) => {
          setErrorMsg(obtenerMensajeErrorApi(error, 'No se pudieron guardar los cambios.'));
        },
      },
    );
  };

  return (
    <div className="p-5 border border-mist bg-white rounded-card shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-ink">Datos Personales y Salud</h4>
        {editando ? (
          <button
            onClick={() => setEditando(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-ink-soft hover:text-ink hover:bg-mist/60 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        ) : (
          <button
            onClick={iniciarEdicion}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-pine-soft hover:bg-pine-soft/5 border border-pine-soft/30 rounded-md transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
        )}
      </div>

      {!editando ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <CampoLectura label="RUT" value={paciente.rut ? formatearRutInput(paciente.rut) : null} />
            <CampoLectura label="Ocupación" value={paciente.ocupacion} />
            <CampoLectura label="Teléfono" value={paciente.telefono} />
            <CampoLectura label="Correo electrónico" value={paciente.email} />
            <div className="col-span-2">
              <CampoLectura label="Dirección" value={paciente.direccion} />
            </div>
          </div>
          <div className="pt-4 border-t border-mist/70 space-y-3">
            <ListaChipsLectura label="Enfermedades / condiciones" values={paciente.enfermedades || []} chipClassName="bg-clinical-red/5 text-clinical-red border-clinical-red/30" />
            <ListaChipsLectura label="Alergias alimentarias" values={paciente.alergias || []} chipClassName="bg-apricot/10 text-[#8a5a2a] border-apricot/50" />
            <ListaChipsLectura label="Preferencias alimentarias" values={paciente.preferencias_alimentarias || []} chipClassName="bg-pine-soft/5 text-pine-soft border-pine-soft/30" />
            <CampoLectura label="Notas" value={paciente.notas_preferencias} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className={labelClass}>Ocupación</label>
              <input type="text" className={inputClass} value={form.ocupacion} onChange={e => set('ocupacion', e.target.value)} placeholder="Ej: Profesora" />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input type="tel" className={inputClass} value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+56 9 1234 5678" />
            </div>
            <div>
              <label className={labelClass}>Correo electrónico</label>
              <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} placeholder="paciente@correo.com" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Dirección</label>
              <input type="text" className={inputClass} value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Av. Providencia 1234, Santiago" />
            </div>
          </div>

          <div className="pt-4 border-t border-mist/70 space-y-4">
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
          </div>

          {errorMsg && <div className="p-3 bg-clinical-red/5 border border-clinical-red/30 rounded-lg text-sm text-clinical-red">{errorMsg}</div>}

          <button
            onClick={handleGuardar}
            disabled={rutInvalido || updatePaciente.isPending}
            className="w-full py-2 bg-pine hover:bg-pine-soft disabled:opacity-60 text-white font-medium rounded-md text-sm transition-colors"
          >
            {updatePaciente.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      )}
    </div>
  );
};
