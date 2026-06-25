import React, { useState, useEffect } from "react";
import { usePacientes } from "../hooks/usePacientes";
import { useClinicalStore } from "../../../shared/store/useClinicalStore";
import { useAuthStore } from "../../../shared/store/useAuthStore";
import { Loader2, Star, Trash2, Printer, Plus } from "lucide-react";
import type { Paciente } from "../types/paciente.types";
import { ModalNuevoPaciente } from "./ModalNuevoPaciente";
import { DatosPersonalesPaciente } from "./DatosPersonalesPaciente";
import {
  useEvaluacionesByPaciente,
  useCreateEvaluacion,
  useDeleteEvaluacion,
  useUpdateEvaluacion,
} from "../../evaluaciones/hooks/useEvaluaciones";
import { HistorialEvaluaciones } from "../../evaluaciones/components/HistorialEvaluaciones";
import type { CreateEvaluacionPayload } from "../../evaluaciones/types/evaluacion.types";
import { useDeletePauta } from "../../pautas/hooks/usePautas";
import {
  usePlanificaciones,
  useDeletePlanificacion,
} from "../../planificaciones/hooks/usePlanificaciones";
import { NUTRITION_GROUPS, comidasOrdenadas } from "../../porciones/constants";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PautaDocumentPDF } from "../../porciones/components/PautaDocumentPDF";
import { formatearFecha } from "../../../shared/utils/fechas";
import { usePerfilNutricionista } from "../../perfil/hooks/usePerfil";

const calculateAge = (birthDateString: string) => {
  // Usamos los componentes de la parte de fecha del ISO para evitar el desfase
  // de zona horaria (ver shared/utils/fechas.ts).
  const [y, m, d] = (birthDateString || "").slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return 0;
  const today = new Date();
  let age = today.getFullYear() - y;
  const diffMes = today.getMonth() + 1 - m;
  if (diffMes < 0 || (diffMes === 0 && today.getDate() < d)) {
    age--;
  }
  return age;
};

const mapToPatientData = (p: Paciente) => ({
  id: p.id,
  nombre: `${p.nombre} ${p.apellido}`,
  edad: calculateAge(p.fecha_nacimiento),
  sexo: p.sexo_biologico || "N/A",
});

export const FichasPacientes: React.FC = () => {
  const { data: pacientes, isLoading, error } = usePacientes();
  const { activePatient, setActivePatient, setPesoActivo, setTmbPromedio } =
    useClinicalStore();
  const { user } = useAuthStore();
  const { data: perfil } = usePerfilNutricionista();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"datos" | "pautas">("datos");
  const [showNuevoPaciente, setShowNuevoPaciente] = useState(false);

  const { data: evaluaciones, isLoading: loadingEvals } =
    useEvaluacionesByPaciente(selectedPatientId || "");
  const createEvaluacion = useCreateEvaluacion();
  const deleteEvaluacion = useDeleteEvaluacion(selectedPatientId || "");
  const updateEvaluacion = useUpdateEvaluacion(selectedPatientId || "");
  const deletePauta = useDeletePauta(selectedPatientId || "");

  const { data: planificacionesAll, isLoading: loadingPlanificaciones } =
    usePlanificaciones();
  const planificacionesDelPaciente =
    planificacionesAll?.filter(
      (p: any) => p.paciente_id === selectedPatientId,
    ) || [];
  const deletePlanificacion = useDeletePlanificacion();

  // Seleccionar localmente el primer paciente o el activo si existe
  useEffect(() => {
    if (pacientes && pacientes.length > 0 && !selectedPatientId) {
      if (activePatient && pacientes.find((p) => p.id === activePatient.id)) {
        setSelectedPatientId(activePatient.id);
      } else {
        setSelectedPatientId(pacientes[0].id);
      }
    }
  }, [pacientes, selectedPatientId, activePatient]);

  const pacienteSeleccionado = pacientes?.find(
    (p) => p.id === selectedPatientId,
  );

  // Manejar establecimiento de paciente activo
  const handleSetActive = () => {
    if (!pacienteSeleccionado) return;
    const latestEval =
      evaluaciones && evaluaciones.length > 0 ? evaluaciones[0] : null;
    const peso = latestEval?.peso_actual || 0;
    const talla = latestEval?.talla_cm || 0;

    setActivePatient({
      ...mapToPatientData(pacienteSeleccionado),
      talla,
      peso,
    });
    if (latestEval) {
      setPesoActivo(latestEval.peso_actual);
      if (latestEval.tmb) setTmbPromedio(latestEval.tmb);
    }
  };

  // Estado local para nueva evaluación
  const [showNuevaEval, setShowNuevaEval] = useState(false);
  const [nuevaEvalForm, setNuevaEvalForm] = useState<
    Omit<CreateEvaluacionPayload, "paciente_id">
  >({
    peso_actual: 0,
    talla_cm: 0,
    nivel_actividad_fisica: "sedentario",
    objetivo: "mantencion",
  });

  return (
    <div className="flex flex-col h-full bg-porcelain flex-1 overflow-hidden w-full">
      <div className="p-3 sm:p-4 md:p-8 max-w-7xl mx-auto w-full lg:h-full flex flex-col overflow-x-hidden">
        {/* Encabezado Principal */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink">
            Fichas de Pacientes
          </h1>
          <p className="text-ink-soft mt-1">Gestión y seguimiento clínico</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:flex-1 lg:min-h-0">
          {/* PANEL IZQUIERDO: LISTA DE PACIENTES */}
          <div className="lg:col-span-4 flex flex-col h-72 lg:h-auto lg:min-h-0">
            <div className="bg-white text-ink flex flex-col rounded-card border border-mist h-full overflow-hidden shadow-sm">
              <div className="px-6 pt-6 pb-4 border-b border-mist/70 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-lg leading-none mb-1">
                    Pacientes Activos
                  </h4>
                  <p className="text-sm text-ink-soft">
                    {pacientes?.length ?? 0} pacientes en seguimiento
                  </p>
                </div>
                <button
                  onClick={() => setShowNuevoPaciente(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-pine text-white rounded-md hover:bg-pine-soft transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo
                </button>
              </div>

              <div className="px-6 py-4 flex-1 overflow-y-auto space-y-3">
                {isLoading && (
                  <div className="flex justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-pine-soft" />
                  </div>
                )}
                {error && (
                  <div className="p-4 text-clinical-red bg-clinical-red/5 rounded-lg text-sm">
                    Error al cargar pacientes
                  </div>
                )}
                {pacientes?.length === 0 && (
                  <div className="p-4 text-ink-soft text-sm text-center">
                    No hay pacientes registrados
                  </div>
                )}
                {pacientes?.map((paciente) => {
                  const iniciales =
                    `${paciente.nombre[0]}${paciente.apellido[0]}`.toUpperCase();
                  const edad = calculateAge(paciente.fecha_nacimiento);

                  return (
                    <div
                      key={paciente.id}
                      onClick={() => {
                        setSelectedPatientId(paciente.id);
                        setShowNuevaEval(false);
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPatientId === paciente.id
                          ? "border-pine-soft bg-pine-soft/5"
                          : "border-mist hover:border-mist bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                          <span className="flex h-full w-full items-center justify-center rounded-full bg-pine-soft/10 text-pine-soft font-medium">
                            {iniciales}
                          </span>
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-ink truncate">
                            {paciente.nombre} {paciente.apellido}
                          </p>
                          <p className="text-sm text-ink-soft">
                            {edad} años · {paciente.sexo_biologico || "N/A"}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium text-ink-soft bg-white shadow-sm">
                              - kg
                            </span>
                            <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium bg-mist/60 text-ink-soft">
                              0 síntomas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PANEL DERECHO: DETALLES DEL PACIENTE */}
          <div className="lg:col-span-8 flex flex-col lg:min-h-0">
            <div className="bg-white text-ink flex flex-col rounded-card border border-mist min-h-100 lg:h-full lg:min-h-0 overflow-hidden shadow-sm">
              {!pacienteSeleccionado ? (
                <div className="flex items-center justify-center h-full text-ink-soft">
                  Selecciona un paciente para ver sus detalles
                </div>
              ) : (
                <>
                  <div className="px-6 pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="relative flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full">
                          <span className="flex h-full w-full items-center justify-center rounded-full bg-pine-soft/10 text-pine-soft text-lg sm:text-xl font-medium">
                            {`${pacienteSeleccionado.nombre[0]}${pacienteSeleccionado.apellido[0]}`.toUpperCase()}
                          </span>
                        </span>
                        <div className="min-w-0">
                          <h2 className="text-xl sm:text-2xl font-semibold text-ink wrap-break-word">
                            {pacienteSeleccionado.nombre}{" "}
                            {pacienteSeleccionado.apellido}
                          </h2>
                          <p className="text-ink-soft text-sm truncate">
                            Nutricionista:{" "}
                            {user?.user_metadata?.nombre ||
                              user?.email ||
                              "Nutricionista"}
                          </p>
                        </div>
                      </div>
                      {activePatient?.id === pacienteSeleccionado.id ? (
                        <span className="inline-flex items-center justify-center rounded-md border border-pine-soft/50 px-2 py-0.5 text-xs font-medium bg-pine-soft/10 text-pine-soft shrink-0 self-start sm:self-auto">
                          Paciente Activo en Sistema
                        </span>
                      ) : (
                        <button
                          onClick={handleSetActive}
                          className="inline-flex items-center justify-center rounded-md border border-mist px-3 py-1.5 text-sm font-medium bg-white text-ink-soft hover:bg-pine-soft/5 hover:text-pine-soft transition-colors shadow-sm gap-2 w-full sm:w-auto shrink-0"
                        >
                          <Star className="w-4 h-4" />
                          Establecer como Paciente Activo
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-ink-soft min-w-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-ink-soft/60"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        {pacienteSeleccionado.telefono || "Sin teléfono"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-ink-soft">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-ink-soft/60"
                        >
                          <rect
                            width="20"
                            height="16"
                            x="2"
                            y="4"
                            rx="2"
                          ></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                        {pacienteSeleccionado.email || "Sin email"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-ink-soft">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-ink-soft/60"
                        >
                          <path d="M8 2v4"></path>
                          <path d="M16 2v4"></path>
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="4"
                            rx="2"
                          ></rect>
                          <path d="M3 10h18"></path>
                        </svg>
                        Ingreso:{" "}
                        {formatearFecha(pacienteSeleccionado.fecha_creacion)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-ink-soft">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-ink-soft/60"
                        >
                          <path d="M8 2v4"></path>
                          <path d="M16 2v4"></path>
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="4"
                            rx="2"
                          ></rect>
                          <path d="M3 10h18"></path>
                        </svg>
                        Nacimiento:{" "}
                        {formatearFecha(pacienteSeleccionado.fecha_nacimiento)}
                      </div>
                    </div>

                    {/* MENÚ PESTAÑAS */}
                    <div className="bg-mist/60 p-1 rounded-card grid grid-cols-2 gap-1 mb-4">
                      <button
                        onClick={() => setActiveTab("datos")}
                        className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === "datos" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink-soft"}`}
                      >
                        Datos Clínicos
                      </button>
                      <button
                        onClick={() => setActiveTab("pautas")}
                        className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === "pautas" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink-soft"}`}
                      >
                        Pautas Nutricionales
                      </button>
                      {/* HIDDEN FOR EVALUATION — tab trigger re-enabled post-freeze
                  <button
                    onClick={() => setActiveTab('progreso')}
                    className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'progreso' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink-soft'}`}
                  >
                    Progreso
                  </button>
                  */}
                    </div>
                  </div>

                  {/* CONTENIDO PESTAÑAS */}
                  <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {/* --- TAB 1: DATOS CLÍNICOS --- */}
                    {activeTab === "datos" && (
                      <div className="space-y-6 animate-in fade-in duration-300 mt-2">
                        <DatosPersonalesPaciente
                          key={pacienteSeleccionado.id}
                          paciente={pacienteSeleccionado}
                        />

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                          <h4 className="font-semibold text-ink">
                            Historial de Evaluaciones
                          </h4>
                          <button
                            onClick={() => setShowNuevaEval(!showNuevaEval)}
                            className="w-full sm:w-auto px-3 py-1.5 text-sm font-medium bg-pine text-white rounded-md hover:bg-pine-soft transition-colors"
                          >
                            {showNuevaEval ? "Cancelar" : "+ Nueva Evaluación"}
                          </button>
                        </div>

                        {showNuevaEval && (
                          <div className="p-5 border border-pine-soft/30 bg-pine-soft/5 rounded-card mb-6 shadow-sm">
                            <h5 className="font-semibold text-pine-soft mb-4">
                              Registrar Nueva Evaluación
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="text-xs font-medium text-ink-soft mb-1 block">
                                  Peso Actual (kg)
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={nuevaEvalForm.peso_actual || ""}
                                  onChange={(e) =>
                                    setNuevaEvalForm({
                                      ...nuevaEvalForm,
                                      peso_actual: parseFloat(e.target.value),
                                    })
                                  }
                                  className="w-full p-2 border border-mist rounded-md text-sm outline-none focus:ring-2 focus:ring-pine-soft"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-ink-soft mb-1 block">
                                  Talla (cm)
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={nuevaEvalForm.talla_cm || ""}
                                  onChange={(e) =>
                                    setNuevaEvalForm({
                                      ...nuevaEvalForm,
                                      talla_cm: parseFloat(e.target.value),
                                    })
                                  }
                                  className="w-full p-2 border border-mist rounded-md text-sm outline-none focus:ring-2 focus:ring-pine-soft"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-ink-soft mb-1 block">
                                  Nivel de Actividad
                                </label>
                                <select
                                  value={nuevaEvalForm.nivel_actividad_fisica}
                                  onChange={(e) =>
                                    setNuevaEvalForm({
                                      ...nuevaEvalForm,
                                      nivel_actividad_fisica: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 border border-mist rounded-md text-sm outline-none focus:ring-2 focus:ring-pine-soft"
                                >
                                  <option value="sedentario">Sedentario</option>
                                  <option value="ligero">
                                    Ligero (1-3 días)
                                  </option>
                                  <option value="moderado">
                                    Moderado (3-5 días)
                                  </option>
                                  <option value="activo">
                                    Activo (6-7 días)
                                  </option>
                                  <option value="muy_activo">
                                    Muy Activo (2x día)
                                  </option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-ink-soft mb-1 block">
                                  Objetivo
                                </label>
                                <select
                                  value={nuevaEvalForm.objetivo}
                                  onChange={(e) =>
                                    setNuevaEvalForm({
                                      ...nuevaEvalForm,
                                      objetivo: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 border border-mist rounded-md text-sm outline-none focus:ring-2 focus:ring-pine-soft"
                                >
                                  <option value="perdida_peso">
                                    Pérdida de Peso
                                  </option>
                                  <option value="mantencion">Mantención</option>
                                  <option value="ganancia_muscular">
                                    Ganancia Muscular
                                  </option>
                                </select>
                              </div>
                            </div>
                            <button
                              disabled={createEvaluacion.isPending}
                              onClick={() => {
                                if (pacienteSeleccionado?.id) {
                                  createEvaluacion.mutate(
                                    {
                                      ...nuevaEvalForm,
                                      paciente_id: pacienteSeleccionado.id,
                                    },
                                    {
                                      onSuccess: () => {
                                        setShowNuevaEval(false);
                                      },
                                    },
                                  );
                                }
                              }}
                              className="w-full py-2 bg-pine hover:bg-pine-soft disabled:opacity-60 text-white font-medium rounded-md text-sm transition-colors"
                            >
                              {createEvaluacion.isPending
                                ? "Guardando..."
                                : "Guardar Evaluación"}
                            </button>
                          </div>
                        )}

                        <HistorialEvaluaciones
                          evaluaciones={evaluaciones}
                          isLoading={loadingEvals}
                          onUpdateEvaluation={(id, payload) =>
                            updateEvaluacion.mutateAsync({ id, payload })
                          }
                          onDeleteEvaluation={(id) =>
                            deleteEvaluacion.mutate(id)
                          }
                        />
                      </div>
                    )}

                    {/* --- TAB 1.5: PAUTAS NUTRICIONALES --- */}
                    {activeTab === "pautas" && (
                      <div className="space-y-6 animate-in fade-in duration-300 mt-2">
                        <div className="mb-4">
                          <h4 className="font-semibold text-ink">
                            Pautas Nutricionales
                          </h4>
                          <p className="text-sm text-ink-soft">
                            Historial de pautas con distribución de porciones
                          </p>
                        </div>

                        {loadingPlanificaciones ? (
                          <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-pine-soft" />
                          </div>
                        ) : planificacionesDelPaciente.length === 0 ? (
                          <div className="text-center p-8 bg-porcelain border border-dashed border-mist rounded-card">
                            <p className="text-ink-soft">
                              No hay planificaciones ni pautas guardadas para
                              este paciente.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {planificacionesDelPaciente.map(
                              (planificacion: any) => (
                                <div
                                  key={planificacion.id}
                                  className="p-4 sm:p-6 border border-mist bg-white rounded-card shadow-md transition-shadow"
                                >
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5 pb-4 border-b border-mist">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-semibold text-ink text-lg sm:text-xl truncate">
                                          {planificacion.nombre ||
                                            "Planificación"}
                                        </span>
                                        {planificacion.activa && (
                                          <span className="px-2 py-0.5 bg-pine-soft/10 text-pine-soft text-xs font-semibold border border-pine-soft/30 rounded-full shrink-0">
                                            Activa
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-ink-soft mt-1">
                                        Creada el{" "}
                                        {formatearFecha(
                                          planificacion.fecha_creacion,
                                        )}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <span className="px-4 py-1.5 bg-pine-soft/5 text-pine-soft text-sm font-bold border border-pine-soft/30 rounded-full whitespace-nowrap">
                                        {Math.round(
                                          planificacion.calorias_totales,
                                        )}{" "}
                                        kcal
                                      </span>
                                      <button
                                        onClick={() => {
                                          if (
                                            window.confirm(
                                              "¿Estás seguro de que deseas eliminar esta planificación y TODAS sus pautas asociadas? Esta acción no se puede deshacer.",
                                            )
                                          ) {
                                            deletePlanificacion.mutate(
                                              planificacion.id,
                                            );
                                          }
                                        }}
                                        disabled={deletePlanificacion.isPending}
                                        className="p-2 text-clinical-red hover:text-clinical-red hover:bg-clinical-red/5 rounded-lg transition-colors border border-transparent hover:border-clinical-red/30"
                                        title="Eliminar Planificación Completa"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-clinical-red/5 p-4 rounded-card border border-clinical-red/20 flex flex-col items-center justify-center">
                                      <p className="text-sm font-medium text-clinical-red mb-1">
                                        Proteínas
                                      </p>
                                      <p className="text-2xl font-bold text-clinical-red">
                                        {Math.round(
                                          planificacion.distribucion_macros
                                            ?.proteina || 0,
                                        )}
                                        %
                                      </p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-card border border-blue-100 flex flex-col items-center justify-center">
                                      <p className="text-sm font-medium text-blue-800 mb-1">
                                        Carbohidratos
                                      </p>
                                      <p className="text-2xl font-bold text-blue-600">
                                        {Math.round(
                                          planificacion.distribucion_macros
                                            ?.carbohidratos || 0,
                                        )}
                                        %
                                      </p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-card border border-yellow-100 flex flex-col items-center justify-center">
                                      <p className="text-sm font-medium text-yellow-800 mb-1">
                                        Grasas
                                      </p>
                                      <p className="text-2xl font-bold text-yellow-600">
                                        {Math.round(
                                          planificacion.distribucion_macros
                                            ?.grasa || 0,
                                        )}
                                        %
                                      </p>
                                    </div>
                                  </div>

                                  {/* Pautas Anidadas */}
                                  {planificacion.pautas &&
                                  planificacion.pautas.length > 0 ? (
                                    <div className="mt-6">
                                      <h5 className="font-semibold text-ink mb-4 flex items-center gap-2">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="text-ink-soft"
                                        >
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                          <polyline points="14 2 14 8 20 8"></polyline>
                                          <line
                                            x1="16"
                                            y1="13"
                                            x2="8"
                                            y2="13"
                                          ></line>
                                          <line
                                            x1="16"
                                            y1="17"
                                            x2="8"
                                            y2="17"
                                          ></line>
                                          <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                        Pautas Asociadas (
                                        {planificacion.pautas.length})
                                      </h5>
                                      <div className="space-y-4 pl-2 border-l-2 border-pine-soft/20">
                                        {planificacion.pautas.map(
                                          (pauta: any) => (
                                            <div
                                              key={pauta.id}
                                              className="p-4 border border-mist/70 bg-porcelain rounded-lg shadow-sm"
                                            >
                                              <div className="flex justify-between items-center mb-3">
                                                <div>
                                                  <span className="font-medium text-pine-soft text-md">
                                                    {pauta.nombre ||
                                                      pauta.descripcion_general ||
                                                      "Pauta"}
                                                  </span>
                                                  <span className="text-xs text-ink-soft ml-2 block sm:inline">
                                                    (Añadida el{" "}
                                                    {formatearFecha(
                                                      pauta.fecha_creacion,
                                                    )}
                                                    )
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <PDFDownloadLink
                                                    document={
                                                      <PautaDocumentPDF
                                                        data={(() => {
                                                          const ultimaEval =
                                                            evaluaciones?.[0];
                                                          const kcal =
                                                            Math.round(
                                                              planificacion.calorias_totales ||
                                                                0,
                                                            );
                                                          const dm =
                                                            planificacion.distribucion_macros ||
                                                            {};
                                                          const tallaM =
                                                            (ultimaEval?.talla_cm ||
                                                              0) / 100;
                                                          return {
                                                            paciente: {
                                                              nombre:
                                                                `${pacienteSeleccionado?.nombre ?? ""} ${pacienteSeleccionado?.apellido ?? ""}`.trim(),
                                                              rut:
                                                                pacienteSeleccionado?.rut ||
                                                                "",
                                                              edad: pacienteSeleccionado?.fecha_nacimiento
                                                                ? calculateAge(
                                                                    pacienteSeleccionado.fecha_nacimiento,
                                                                  )
                                                                : 0,
                                                              sexo:
                                                                pacienteSeleccionado?.sexo_biologico ||
                                                                "",
                                                              peso:
                                                                ultimaEval?.peso_actual ||
                                                                0,
                                                              talla:
                                                                ultimaEval?.talla_cm ||
                                                                0,
                                                              imc:
                                                                tallaM > 0 &&
                                                                ultimaEval?.peso_actual
                                                                  ? (
                                                                      ultimaEval.peso_actual /
                                                                      (tallaM *
                                                                        tallaM)
                                                                    ).toFixed(1)
                                                                  : "",
                                                            },
                                                            nutricionista: {
                                                              nombre: perfil
                                                                ? `${perfil.nombre} ${perfil.apellido}`.trim()
                                                                : "",
                                                              registro:
                                                                perfil?.registro_profesional ||
                                                                "",
                                                            },
                                                            fechaEmision:
                                                              new Intl.DateTimeFormat(
                                                                "es-CL",
                                                                {
                                                                  day: "2-digit",
                                                                  month: "long",
                                                                  year: "numeric",
                                                                },
                                                              ).format(
                                                                new Date(
                                                                  pauta.fecha_creacion ||
                                                                    new Date(),
                                                                ),
                                                              ),
                                                            objetivos: {
                                                              kcal,
                                                              prot_g:
                                                                Math.round(
                                                                  (((dm.proteina ||
                                                                    0) /
                                                                    100) *
                                                                    kcal) /
                                                                    4,
                                                                ),
                                                              cho_g: Math.round(
                                                                (((dm.carbohidratos ||
                                                                  0) /
                                                                  100) *
                                                                  kcal) /
                                                                  4,
                                                              ),
                                                              fat_g: Math.round(
                                                                (((dm.grasa ||
                                                                  0) /
                                                                  100) *
                                                                  kcal) /
                                                                  9,
                                                              ),
                                                            },
                                                            distributions:
                                                              pauta
                                                                .estructura_grid_json
                                                                ?.distributions ||
                                                              {},
                                                            targets:
                                                              pauta
                                                                .estructura_grid_json
                                                                ?.targets || {},
                                                            comidas:
                                                              comidasOrdenadas(
                                                                pauta
                                                                  .estructura_grid_json
                                                                  ?.activeMeals ||
                                                                  [],
                                                                pauta
                                                                  .estructura_grid_json
                                                                  ?.customMeals ||
                                                                  [],
                                                                pauta
                                                                  .estructura_grid_json
                                                                  ?.mealTimes ||
                                                                  {},
                                                              ),
                                                            totals:
                                                              NUTRITION_GROUPS.reduce(
                                                                (acc, g) => {
                                                                  acc[g.id] =
                                                                    Object.values(
                                                                      pauta
                                                                        .estructura_grid_json
                                                                        ?.distributions ||
                                                                        {},
                                                                    ).reduce(
                                                                      (
                                                                        sum: number,
                                                                        meal: any,
                                                                      ) =>
                                                                        sum +
                                                                        (meal[
                                                                          g.id
                                                                        ] || 0),
                                                                      0,
                                                                    );
                                                                  return acc;
                                                                },
                                                                {} as Record<
                                                                  string,
                                                                  number
                                                                >,
                                                              ),
                                                          };
                                                        })()}
                                                      />
                                                    }
                                                    fileName={`Pauta_${pacienteSeleccionado?.nombre?.replace(/\s+/g, "_")}_${pacienteSeleccionado?.apellido?.replace(/\s+/g, "_")}.pdf`}
                                                  >
                                                    {({ loading }) => (
                                                      <button
                                                        disabled={loading}
                                                        className={`p-1.5 rounded-md transition-colors ${loading ? "text-ink-soft/40 cursor-not-allowed" : "text-ink-soft/60 hover:text-pine-soft hover:bg-pine-soft/5"}`}
                                                        title="Exportar a PDF"
                                                      >
                                                        {loading ? (
                                                          <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                          <Printer className="w-4 h-4" />
                                                        )}
                                                      </button>
                                                    )}
                                                  </PDFDownloadLink>
                                                  <button
                                                    onClick={() => {
                                                      if (
                                                        window.confirm(
                                                          `¿Eliminar pauta "${pauta.nombre || pauta.descripcion_general || "Regular"}"?`,
                                                        )
                                                      ) {
                                                        deletePauta.mutate(
                                                          pauta.id,
                                                        );
                                                      }
                                                    }}
                                                    disabled={
                                                      deletePauta.isPending
                                                    }
                                                    className="p-1.5 text-ink-soft/60 hover:text-clinical-red hover:bg-clinical-red/5 rounded-md transition-colors"
                                                    title="Eliminar Pauta"
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </button>
                                                </div>
                                              </div>

                                              {(() => {
                                                const grid =
                                                  pauta.estructura_grid_json ||
                                                  {};
                                                const dist =
                                                  grid.distributions || {};
                                                if (
                                                  Object.keys(dist).length === 0
                                                )
                                                  return null;
                                                const comidas =
                                                  comidasOrdenadas(
                                                    grid.activeMeals || [],
                                                    grid.customMeals || [],
                                                    grid.mealTimes || {},
                                                  );
                                                return (
                                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                                                    {comidas.map((meal) => {
                                                      const mealDist =
                                                        dist[meal.id];
                                                      if (
                                                        !mealDist ||
                                                        Object.keys(mealDist)
                                                          .length === 0
                                                      )
                                                        return null;

                                                      const portions =
                                                        Object.entries(mealDist)
                                                          .filter(
                                                            ([_, qty]) =>
                                                              (qty as number) >
                                                              0,
                                                          )
                                                          .map(
                                                            ([
                                                              groupId,
                                                              qty,
                                                            ]) => {
                                                              const groupInfo =
                                                                NUTRITION_GROUPS.find(
                                                                  (g) =>
                                                                    g.id ===
                                                                    groupId,
                                                                ) ||
                                                                grid.customFoods?.find(
                                                                  (g: any) =>
                                                                    g.id ===
                                                                    groupId,
                                                                );
                                                              return {
                                                                label: groupInfo
                                                                  ? `${groupInfo.emoji} ${groupInfo.label}`
                                                                  : groupId,
                                                                qty,
                                                              };
                                                            },
                                                          );

                                                      if (portions.length === 0)
                                                        return null;

                                                      return (
                                                        <div
                                                          key={meal.id}
                                                          className="bg-white p-2.5 rounded-md border border-mist"
                                                        >
                                                          <p className="text-[11px] font-bold text-ink-soft uppercase mb-1.5 border-b border-mist/70 pb-1 truncate">
                                                            {meal.name}
                                                          </p>
                                                          <ul className="space-y-0.5">
                                                            {portions.map(
                                                              (p, idx) => (
                                                                <li
                                                                  key={idx}
                                                                  className="text-xs text-ink-soft flex justify-between items-center"
                                                                >
                                                                  <span className="truncate mr-2">
                                                                    {p.label}
                                                                  </span>
                                                                  <span className="font-semibold text-pine-soft bg-pine-soft/5 px-1.5 rounded">
                                                                    {String(
                                                                      p.qty,
                                                                    )}
                                                                  </span>
                                                                </li>
                                                              ),
                                                            )}
                                                          </ul>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                );
                                              })()}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mt-4 p-4 text-center bg-porcelain rounded-lg border border-dashed border-mist">
                                      <p className="text-sm text-ink-soft">
                                        Esta planificación aún no tiene pautas
                                        asignadas.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* --- TAB 2: PROGRESO — HIDDEN FOR EVALUATION (métricas hardcodeadas) — re-enable post-freeze
                {activeTab === 'progreso' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2 mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                      <h4 className="font-semibold text-ink">Evolución del Tratamiento</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-pine-soft/5 rounded-card border border-pine-soft/30">
                        <div className="flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pine-soft"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg>
                          <p className="text-sm font-medium text-pine-soft">Pérdida de Peso</p>
                        </div>
                        <p className="text-3xl font-semibold text-pine-soft">6.0 kg</p>
                        <p className="text-xs text-pine-soft mt-1">7.7% del peso inicial</p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-card border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                          <p className="text-sm font-medium text-blue-900">Tiempo en Tratamiento</p>
                        </div>
                        <p className="text-3xl font-semibold text-blue-700">5 meses</p>
                        <p className="text-xs text-blue-600 mt-1">Desde 14-12-2025</p>
                      </div>
                    </div>

                    <div className="p-4 bg-porcelain rounded-card border border-mist/70 mt-6">
                      <p className="text-sm font-semibold text-ink mb-4">Resumen de Adherencia</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-mist">
                          <span className="text-sm text-ink-soft">Consultas asistidas</span>
                          <span className="text-sm font-semibold text-ink">8/8</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-mist">
                          <span className="text-sm text-ink-soft">Síntomas reportados</span>
                          <span className="text-sm font-semibold text-ink">0</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-sm text-ink-soft">Estado del tratamiento</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-md">En progreso</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                */}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalNuevoPaciente
        isOpen={showNuevoPaciente}
        onClose={() => setShowNuevoPaciente(false)}
        onCreated={(pacienteId) => {
          setSelectedPatientId(pacienteId);
          setActiveTab("datos");
        }}
      />
    </div>
  );
};
