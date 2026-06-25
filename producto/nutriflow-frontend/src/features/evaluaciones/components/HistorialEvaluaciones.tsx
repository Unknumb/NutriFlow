import React, { useState } from 'react';
import { Check, Loader2, Pencil, Trash2, X } from 'lucide-react';
import type { Evaluacion, UpdateEvaluacionPayload } from '../types/evaluacion.types';
import { formatearFecha } from '../../../shared/utils/fechas';

type EditPayload = Pick<
  UpdateEvaluacionPayload,
  'peso_actual' | 'talla_cm' | 'nivel_actividad_fisica' | 'objetivo' | 'tmb' | 'gasto_energetico_total'
>;

interface Props {
  evaluaciones: Evaluacion[] | undefined;
  isLoading: boolean;
  onUpdateEvaluation: (id: string, payload: EditPayload) => Promise<unknown>;
  onDeleteEvaluation: (id: string) => void;
}

const ACTIVIDAD_OPTIONS = [
  { value: 'sedentario', label: 'Sedentario' },
  { value: 'ligero', label: 'Ligero (1-3 días)' },
  { value: 'moderado', label: 'Moderado (3-5 días)' },
  { value: 'activo', label: 'Activo (6-7 días)' },
  { value: 'muy_activo', label: 'Muy Activo (2x día)' },
];

const OBJETIVO_OPTIONS = [
  { value: 'perdida_peso', label: 'Pérdida de Peso' },
  { value: 'mantencion', label: 'Mantención' },
  { value: 'ganancia_muscular', label: 'Ganancia Muscular' },
];

const EMPTY_FORM: EditPayload = {
  peso_actual: 0,
  talla_cm: 0,
  nivel_actividad_fisica: 'sedentario',
  objetivo: 'mantencion',
  tmb: undefined,
  gasto_energetico_total: undefined,
};

export const HistorialEvaluaciones: React.FC<Props> = ({
  evaluaciones,
  isLoading,
  onUpdateEvaluation,
  onDeleteEvaluation,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditPayload>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = (evaluacion: Evaluacion) => {
    setEditingId(evaluacion.id);
    setEditForm({
      peso_actual: evaluacion.peso_actual,
      talla_cm: evaluacion.talla_cm,
      nivel_actividad_fisica: evaluacion.nivel_actividad_fisica,
      objetivo: evaluacion.objetivo,
      tmb: evaluacion.tmb,
      gasto_energetico_total: evaluacion.gasto_energetico_total,
    });
  };

  const handleCancel = () => setEditingId(null);

  const handleSave = async (evalId: string) => {
    setIsSaving(true);
    try {
      await onUpdateEvaluation(evalId, editForm);
      setEditingId(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta evaluación? Esta acción no se puede deshacer.')) {
      onDeleteEvaluation(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-pine-soft" />
      </div>
    );
  }

  if (!evaluaciones?.length) {
    return (
      <div className="text-center p-8 bg-porcelain border border-dashed border-mist rounded-card">
        <p className="text-ink-soft">No hay evaluaciones registradas para este paciente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {evaluaciones.map((evaluacion) => {
        const isEditing = editingId === evaluacion.id;

        return (
          <div
            key={evaluacion.id}
            className={`p-4 border rounded-card shadow-sm transition-colors ${
              isEditing ? 'border-pine-soft/40 bg-pine-soft/5' : 'border-mist bg-white'
            }`}
          >
            {/* HEADER */}
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3 pb-3 border-b border-mist/70">
              <span className="font-medium text-ink">{formatearFecha(evaluacion.fecha_evaluacion)}</span>
              <div className="flex items-center gap-1.5">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => handleSave(evaluacion.id)}
                      disabled={isSaving}
                      aria-label="Guardar cambios"
                      title="Guardar cambios"
                      className="p-1.5 text-pine-soft hover:text-pine hover:bg-pine-soft/10 rounded-md transition-colors disabled:opacity-50"
                    >
                      {isSaving
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={handleCancel}
                      aria-label="Cancelar edición"
                      title="Cancelar"
                      className="p-1.5 text-ink-soft/50 hover:text-ink hover:bg-mist/60 rounded-md transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 rounded-md uppercase whitespace-nowrap">
                      {evaluacion.objetivo.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => handleStartEdit(evaluacion)}
                      aria-label="Editar evaluación"
                      title="Editar evaluación"
                      className="p-1.5 text-ink-soft/50 hover:text-ink hover:bg-mist/60 rounded-md transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(evaluacion.id)}
                      aria-label="Borrar evaluación"
                      title="Eliminar evaluación"
                      className="p-1.5 text-ink-soft/50 hover:text-clinical-red hover:bg-clinical-red/5 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* BODY */}
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink-soft mb-1 block">Peso Actual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.peso_actual}
                    onChange={(e) =>
                      setEditForm({ ...editForm, peso_actual: parseFloat(e.target.value) || 0 })
                    }
                    aria-label="Peso actual"
                    className="w-full p-2 border border-mist rounded-md text-sm outline-none focus:ring-2 focus:ring-pine-soft"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-soft mb-1 block">Talla (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.talla_cm}
                    onChange={(e) =>
                      setEditForm({ ...editForm, talla_cm: parseFloat(e.target.value) || 0 })
                    }
                    aria-label="Talla"
                    className="w-full p-2 border border-mist rounded-md text-sm outline-none focus:ring-2 focus:ring-pine-soft"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-soft mb-1 block">Nivel de Actividad</label>
                  <select
                    value={editForm.nivel_actividad_fisica}
                    onChange={(e) => setEditForm({ ...editForm, nivel_actividad_fisica: e.target.value })}
                    aria-label="Nivel de actividad"
                    className="w-full p-2 border border-mist rounded-md text-sm outline-none focus:ring-2 focus:ring-pine-soft"
                  >
                    {ACTIVIDAD_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-soft mb-1 block">Objetivo</label>
                  <select
                    value={editForm.objetivo}
                    onChange={(e) => setEditForm({ ...editForm, objetivo: e.target.value })}
                    aria-label="Objetivo"
                    className="w-full p-2 border border-mist rounded-md text-sm outline-none focus:ring-2 focus:ring-pine-soft"
                  >
                    {OBJETIVO_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-soft mb-1 block">TMB Estimada (kcal)</label>
                  <input
                    type="number"
                    step="1"
                    value={editForm.tmb ?? ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tmb: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                    aria-label="TMB estimada"
                    placeholder="Calculada automáticamente"
                    className="w-full p-2 border border-mist rounded-md text-sm outline-none focus:ring-2 focus:ring-pine-soft"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-soft mb-1 block">Gasto Total (kcal)</label>
                  <input
                    type="number"
                    step="1"
                    value={editForm.gasto_energetico_total ?? ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, gasto_energetico_total: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                    aria-label="Gasto energético total"
                    placeholder="Calculado automáticamente"
                    className="w-full p-2 border border-mist rounded-md text-sm outline-none focus:ring-2 focus:ring-pine-soft"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-ink-soft mb-0.5">Peso</p>
                  <p className="font-semibold text-ink">{evaluacion.peso_actual} kg</p>
                </div>
                <div>
                  <p className="text-xs text-ink-soft mb-0.5">Talla</p>
                  <p className="font-semibold text-ink">{evaluacion.talla_cm} cm</p>
                </div>
                <div>
                  <p className="text-xs text-ink-soft mb-0.5">TMB Estimada</p>
                  <p className="font-semibold text-pine-soft">
                    {evaluacion.tmb ? `${Math.round(evaluacion.tmb)} kcal` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-soft mb-0.5">Gasto Total (GET)</p>
                  <p className="font-semibold text-pine-soft">
                    {evaluacion.gasto_energetico_total
                      ? `${Math.round(evaluacion.gasto_energetico_total)} kcal`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
