import React, { useState, useEffect } from 'react';
import { usePacientes } from '../hooks/usePacientes';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { useAuthStore } from '../../../shared/store/useAuthStore';
import { Loader2, Star } from 'lucide-react';
import type { Paciente } from '../types/paciente.types';
import { useEvaluacionesByPaciente, useCreateEvaluacion } from '../../evaluaciones/hooks/useEvaluaciones';
import type { CreateEvaluacionPayload } from '../../evaluaciones/types/evaluacion.types';
import { usePlanificaciones, useDeletePlanificacion } from '../../planificaciones/hooks/usePlanificaciones';
import { Trash2 } from 'lucide-react';

const calculateAge = (birthDateString: string) => {
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const mapToPatientData = (p: Paciente) => ({
  id: p.id,
  nombre: `${p.nombre} ${p.apellido}`,
  edad: calculateAge(p.fecha_nacimiento),
  sexo: p.sexo_biologico || 'N/A',
});

export const FichasPacientes: React.FC = () => {
  const { data: pacientes, isLoading, error } = usePacientes();
  const { activePatient, setActivePatient, setPesoActivo, setTmbPromedio } = useClinicalStore();
  const { user } = useAuthStore();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('datos');

  const { data: evaluaciones, isLoading: loadingEvals } = useEvaluacionesByPaciente(selectedPatientId || '');
  const createEvaluacion = useCreateEvaluacion();
  
  const { data: planificacionesAll, isLoading: loadingPlanificaciones } = usePlanificaciones();
  const planificacionesDelPaciente = planificacionesAll?.filter((p: any) => p.paciente_id === selectedPatientId) || [];
  const deletePlanificacion = useDeletePlanificacion();

  // Seleccionar localmente el primer paciente o el activo si existe
  useEffect(() => {
    if (pacientes && pacientes.length > 0 && !selectedPatientId) {
      if (activePatient && pacientes.find(p => p.id === activePatient.id)) {
        setSelectedPatientId(activePatient.id);
      } else {
        setSelectedPatientId(pacientes[0].id);
      }
    }
  }, [pacientes, selectedPatientId, activePatient]);

  const pacienteSeleccionado = pacientes?.find(p => p.id === selectedPatientId);

  // Manejar establecimiento de paciente activo
  const handleSetActive = () => {
    if (!pacienteSeleccionado) return;
    const latestEval = evaluaciones && evaluaciones.length > 0 ? evaluaciones[0] : null;
    const peso = latestEval?.peso_actual || 0;
    const talla = latestEval?.talla_cm || 0;
    
    setActivePatient({...mapToPatientData(pacienteSeleccionado), talla, peso});
    if (latestEval) {
      setPesoActivo(latestEval.peso_actual);
      if (latestEval.tmb) setTmbPromedio(latestEval.tmb);
    }
  };

  // Estado local para nueva evaluación
  const [showNuevaEval, setShowNuevaEval] = useState(false);
  const [nuevaEvalForm, setNuevaEvalForm] = useState<Omit<CreateEvaluacionPayload, 'paciente_id'>>({
    peso_actual: 0,
    talla_cm: 0,
    nivel_actividad_fisica: 'sedentario',
    objetivo: 'mantencion'
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 flex-1 overflow-hidden w-full">
      <div className="p-8 max-w-7xl mx-auto w-full h-full flex flex-col">
        
        {/* Encabezado Principal */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Fichas de Pacientes</h1>
          <p className="text-gray-600 mt-1">Gestión y seguimiento clínico</p>
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
          
          {/* PANEL IZQUIERDO: LISTA DE PACIENTES */}
          <div className="col-span-4 flex flex-col min-h-0">
            <div className="bg-white text-gray-900 flex flex-col rounded-xl border border-gray-200 h-full overflow-hidden shadow-sm">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h4 className="font-semibold text-lg leading-none mb-1">Pacientes Activos</h4>
                <p className="text-sm text-gray-600">3 pacientes en seguimiento</p>
              </div>
              
              <div className="px-6 py-4 flex-1 overflow-y-auto space-y-3">
                {isLoading && (
                  <div className="flex justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                  </div>
                )}
                {error && (
                  <div className="p-4 text-red-600 bg-red-50 rounded-lg text-sm">Error al cargar pacientes</div>
                )}
                {pacientes?.length === 0 && (
                  <div className="p-4 text-gray-500 text-sm text-center">No hay pacientes registrados</div>
                )}
                {pacientes?.map((paciente) => {
                  const iniciales = `${paciente.nombre[0]}${paciente.apellido[0]}`.toUpperCase();
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
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        <span className="flex h-full w-full items-center justify-center rounded-full bg-teal-100 text-teal-700 font-medium">
                          {iniciales}
                        </span>
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{paciente.nombre} {paciente.apellido}</p>
                        <p className="text-sm text-gray-600">{edad} años · {paciente.sexo_biologico || 'N/A'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium text-gray-700 bg-white shadow-sm">
                            - kg
                          </span>
                          <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
                            0 síntomas
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </div>

          {/* PANEL DERECHO: DETALLES DEL PACIENTE */}
          <div className="col-span-8 flex flex-col min-h-0">
            <div className="bg-white text-gray-900 flex flex-col rounded-xl border border-gray-200 h-full overflow-hidden shadow-sm">
              
              {!pacienteSeleccionado ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Selecciona un paciente para ver sus detalles
                </div>
              ) : (
                <>
              <div className="px-6 pt-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full">
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xl font-medium">
                        {`${pacienteSeleccionado.nombre[0]}${pacienteSeleccionado.apellido[0]}`.toUpperCase()}
                      </span>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</h2>
                      <p className="text-gray-600">Nutricionista: {user?.user_metadata?.nombre || user?.email || 'Nutricionista'}</p>
                    </div>
                  </div>
                  {activePatient?.id === pacienteSeleccionado.id ? (
                    <span className="inline-flex items-center justify-center rounded-md border border-teal-300 px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-800">
                      Paciente Activo en Sistema
                    </span>
                  ) : (
                    <button
                      onClick={handleSetActive}
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors shadow-sm gap-2"
                    >
                      <Star className="w-4 h-4" />
                      Establecer como Paciente Activo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    {pacienteSeleccionado.telefono || 'Sin teléfono'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                    {pacienteSeleccionado.email || 'Sin email'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                    Ingreso: {new Date(pacienteSeleccionado.fecha_creacion).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                    Nacimiento: {new Date(pacienteSeleccionado.fecha_nacimiento).toLocaleDateString()}
                  </div>
                </div>

                {/* MENÚ PESTAÑAS */}
                <div className="bg-gray-100 p-1 rounded-xl grid grid-cols-4 gap-1 mb-4">
                  <button 
                    onClick={() => setActiveTab('datos')}
                    className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'datos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Datos Clínicos
                  </button>
                  <button 
                    onClick={() => setActiveTab('planificaciones')}
                    className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'planificaciones' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Planificaciones
                  </button>
                  <button 
                    onClick={() => setActiveTab('sintomas')}
                    className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'sintomas' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Síntomas Reportados
                    <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-md text-[10px]">0</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('progreso')}
                    className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'progreso' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Progreso
                  </button>
                </div>
              </div>

              {/* CONTENIDO PESTAÑAS */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                
                {/* --- TAB 1: DATOS CLÍNICOS --- */}
                {activeTab === 'datos' && (
                  <div className="space-y-6 animate-in fade-in duration-300 mt-2">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-900">Historial de Evaluaciones</h4>
                      <button 
                        onClick={() => setShowNuevaEval(!showNuevaEval)}
                        className="px-3 py-1.5 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                      >
                        {showNuevaEval ? 'Cancelar' : '+ Nueva Evaluación'}
                      </button>
                    </div>

                    {showNuevaEval && (
                      <div className="p-5 border border-teal-200 bg-teal-50 rounded-xl mb-6 shadow-sm">
                        <h5 className="font-semibold text-teal-900 mb-4">Registrar Nueva Evaluación</h5>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Peso Actual (kg)</label>
                            <input 
                              type="number" step="0.1"
                              value={nuevaEvalForm.peso_actual || ''}
                              onChange={e => setNuevaEvalForm({...nuevaEvalForm, peso_actual: parseFloat(e.target.value)})}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-teal-500" 
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Talla (cm)</label>
                            <input 
                              type="number" step="0.1"
                              value={nuevaEvalForm.talla_cm || ''}
                              onChange={e => setNuevaEvalForm({...nuevaEvalForm, talla_cm: parseFloat(e.target.value)})}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-teal-500" 
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Nivel de Actividad</label>
                            <select 
                              value={nuevaEvalForm.nivel_actividad_fisica}
                              onChange={e => setNuevaEvalForm({...nuevaEvalForm, nivel_actividad_fisica: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              <option value="sedentario">Sedentario</option>
                              <option value="ligero">Ligero (1-3 días)</option>
                              <option value="moderado">Moderado (3-5 días)</option>
                              <option value="activo">Activo (6-7 días)</option>
                              <option value="muy_activo">Muy Activo (2x día)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Objetivo</label>
                            <select 
                              value={nuevaEvalForm.objetivo}
                              onChange={e => setNuevaEvalForm({...nuevaEvalForm, objetivo: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              <option value="perdida_peso">Pérdida de Peso</option>
                              <option value="mantencion">Mantención</option>
                              <option value="ganancia_muscular">Ganancia Muscular</option>
                            </select>
                          </div>
                        </div>
                        <button 
                          disabled={createEvaluacion.isPending}
                          onClick={() => {
                            if (pacienteSeleccionado?.id) {
                              createEvaluacion.mutate({
                                ...nuevaEvalForm,
                                paciente_id: pacienteSeleccionado.id
                              }, {
                                onSuccess: () => {
                                  setShowNuevaEval(false);
                                }
                              });
                            }
                          }}
                          className="w-full py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium rounded-md text-sm transition-colors"
                        >
                          {createEvaluacion.isPending ? 'Guardando...' : 'Guardar Evaluación'}
                        </button>
                      </div>
                    )}

                    {loadingEvals ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                      </div>
                    ) : evaluaciones?.length === 0 ? (
                      <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                        <p className="text-gray-500">No hay evaluaciones registradas para este paciente.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {evaluaciones?.map(evaluacion => (
                          <div key={evaluacion.id} className="p-4 border border-gray-200 bg-white rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                              <span className="font-medium text-gray-900">{new Date(evaluacion.fecha_evaluacion).toLocaleDateString()}</span>
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 rounded-md uppercase">
                                {evaluacion.objetivo.replace('_', ' ')}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Peso</p>
                                <p className="font-semibold text-gray-900">{evaluacion.peso_actual} kg</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Talla</p>
                                <p className="font-semibold text-gray-900">{evaluacion.talla_cm} cm</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">TMB Estimada</p>
                                <p className="font-semibold text-teal-700">{evaluacion.tmb ? `${Math.round(evaluacion.tmb)} kcal` : 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Gasto Total (GET)</p>
                                <p className="font-semibold text-teal-700">{evaluacion.gasto_energetico_total ? `${Math.round(evaluacion.gasto_energetico_total)} kcal` : 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- TAB 1.5: PLANIFICACIONES --- */}
                {activeTab === 'planificaciones' && (
                  <div className="space-y-6 animate-in fade-in duration-300 mt-2">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900">Planificaciones</h4>
                      <p className="text-sm text-gray-600">Historial de planificaciones asignadas</p>
                    </div>

                    {loadingPlanificaciones ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                      </div>
                    ) : planificacionesDelPaciente.length === 0 ? (
                      <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                        <p className="text-gray-500">No hay planificaciones guardadas para este paciente.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {planificacionesDelPaciente.map((planificacion: any) => (
                          <div key={planificacion.id} className="p-5 border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                              <div>
                                <span className="font-semibold text-gray-900 text-lg">Planificación Nutricional</span>
                                <p className="text-xs text-gray-500">Creada el {new Date(planificacion.fecha_creacion).toLocaleDateString()}</p>
                              </div>
                              <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100 rounded-full">
                                {Math.round(planificacion.calorias_totales)} kcal
                              </span>
                              <button 
                                onClick={() => {
                                  if (window.confirm('¿Estás seguro de que deseas eliminar esta planificación nutricional?')) {
                                    deletePlanificacion.mutate(planificacion.id);
                                  }
                                }}
                                disabled={deletePlanificacion.isPending}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                title="Eliminar Planificación"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <p className="text-xs font-medium text-red-800 mb-1">Proteínas</p>
                                <p className="font-bold text-red-600">{Math.round(planificacion.distribucion_macros?.proteina || 0)}%</p>
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <p className="text-xs font-medium text-blue-800 mb-1">Carbohidratos</p>
                                <p className="font-bold text-blue-600">{Math.round(planificacion.distribucion_macros?.carbohidratos || 0)}%</p>
                              </div>
                              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                <p className="text-xs font-medium text-yellow-800 mb-1">Grasas</p>
                                <p className="font-bold text-yellow-600">{Math.round(planificacion.distribucion_macros?.grasa || 0)}%</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- TAB 2: SÍNTOMAS --- */}
                {activeTab === 'sintomas' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="mb-2 mt-2">
                      <h4 className="font-semibold text-gray-900">Síntomas y Observaciones</h4>
                      <p className="text-sm text-gray-600">Registro de síntomas reportados por el paciente</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <label className="text-sm font-semibold text-gray-900 mb-2 block">Reportar Nuevo Síntoma</label>
                      <textarea 
                        className="w-full min-h-20 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none mb-3" 
                        placeholder="Describe el síntoma o sensación..."
                      ></textarea>
                      <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Tipo</label>
                          <select className="w-full p-2 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-teal-500">
                            <option>Digestivo</option>
                            <option>Energía</option>
                            <option>Peso</option>
                            <option>Otro</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Severidad</label>
                          <select className="w-full p-2 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-teal-500">
                            <option>Leve</option>
                            <option>Moderado</option>
                            <option>Severo</option>
                          </select>
                        </div>
                      </div>
                      <button className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
                        Agregar Síntoma
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">Energía</span>
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 border border-green-200 text-xs font-medium rounded-md">Leve</span>
                          </div>
                          <span className="text-xs text-gray-500">19-03-2026</span>
                        </div>
                        <p className="text-sm text-gray-700">He notado más energía durante las mañanas y menos ansiedad por comer entre comidas</p>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">Digestivo</span>
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-medium rounded-md">Moderado</span>
                          </div>
                          <span className="text-xs text-gray-500">14-03-2026</span>
                        </div>
                        <p className="text-sm text-gray-700">Tuve distensión abdominal después del almuerzo del domingo, creo que comí demasiado rápido</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 3: PROGRESO --- */}
                {activeTab === 'progreso' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2 mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                      <h4 className="font-semibold text-gray-900">Evolución del Tratamiento</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-700"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg>
                          <p className="text-sm font-medium text-teal-900">Pérdida de Peso</p>
                        </div>
                        <p className="text-3xl font-semibold text-teal-700">6.0 kg</p>
                        <p className="text-xs text-teal-600 mt-1">7.7% del peso inicial</p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                          <p className="text-sm font-medium text-blue-900">Tiempo en Tratamiento</p>
                        </div>
                        <p className="text-3xl font-semibold text-blue-700">5 meses</p>
                        <p className="text-xs text-blue-600 mt-1">Desde 14-12-2025</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mt-6">
                      <p className="text-sm font-semibold text-gray-900 mb-4">Resumen de Adherencia</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Consultas asistidas</span>
                          <span className="text-sm font-semibold text-gray-900">8/8</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Síntomas reportados</span>
                          <span className="text-sm font-semibold text-gray-900">0</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-sm text-gray-600">Estado del tratamiento</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-md">En progreso</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};