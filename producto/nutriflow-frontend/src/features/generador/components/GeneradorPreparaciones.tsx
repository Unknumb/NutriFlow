import React, { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useGenerarMenu } from '../../menus/hooks/useMenus';
import { usePortionsStore } from '../../porciones/store/usePortionsStore';
import { usePreparaciones } from '../../preparaciones/hooks/usePreparaciones';
import { usePacientes } from '../../pacientes/hooks/usePacientes';
import { TIPO_COMIDA_LABELS, type TipoComida } from '../../preparaciones/types/preparacion.types';
import {
  RESTRICCIONES_DIETETICAS,
  RESTRICCION_LABELS,
  derivarRestriccionesDePaciente,
  type RestriccionDietetica,
} from '../constants/restricciones';

// Mini-componente para reciclar las filas de porciones sin repetir código
const PorcionRow = ({ emoji, nombre, color, cantidad }: { emoji: string, nombre: string, color: string, cantidad: number }) => (
  <div className="flex items-center justify-between">
    <span className={`text-xs font-medium ${color}`}>{emoji} {nombre}</span>
    <div className="flex items-center gap-1.5">
      <button className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-xs">−</button>
      <span className="w-5 text-center text-sm font-medium text-gray-900">{cantidad}</span>
      <button className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-xs">+</button>
    </div>
  </div>
);

export const GeneradorPreparaciones: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generador');
  const [alimentosRechazados, setAlimentosRechazados] = useState('');
  const [preferencias, setPreferencias] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [restriccionesSel, setRestriccionesSel] = useState<Set<RestriccionDietetica>>(new Set());

  const [busquedaBiblioteca, setBusquedaBiblioteca] = useState('');
  const [filtroTiempo, setFiltroTiempo] = useState<'todos' | TipoComida>('todos');

  const { distributions } = usePortionsStore();
  const { mutate, data: menusGenerados, isPending } = useGenerarMenu();
  const { data: preparaciones, isLoading: cargandoBiblioteca } = usePreparaciones();
  const { data: pacientes } = usePacientes();

  const pacienteSeleccionado = useMemo(
    () => (pacientes ?? []).find((p) => p.id === pacienteId),
    [pacientes, pacienteId],
  );

  // Al elegir paciente se precargan sus restricciones derivadas de la ficha
  // (alergias + preferencias alimentarias). La selección queda editable solo
  // para esta sesión: nunca se escribe de vuelta en la ficha.
  const handleSeleccionPaciente = (id: string) => {
    setPacienteId(id);
    const paciente = (pacientes ?? []).find((p) => p.id === id);
    if (!paciente) {
      setRestriccionesSel(new Set());
      return;
    }
    setRestriccionesSel(
      new Set(
        derivarRestriccionesDePaciente([
          ...paciente.alergias,
          ...paciente.preferencias_alimentarias,
        ]),
      ),
    );
  };

  const toggleRestriccion = (restriccion: RestriccionDietetica) => {
    setRestriccionesSel((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(restriccion)) siguiente.delete(restriccion);
      else siguiente.add(restriccion);
      return siguiente;
    });
  };

  const totalPreparaciones = preparaciones?.length ?? 0;

  const preparacionesFiltradas = useMemo(() => {
    const lista = preparaciones ?? [];
    const termino = busquedaBiblioteca.trim().toLowerCase();
    return lista.filter((p) => {
      const coincideTexto =
        !termino ||
        p.nombre.toLowerCase().includes(termino) ||
        p.ingredientes.some((ing) => ing.nombre.toLowerCase().includes(termino));
      const coincideTiempo = filtroTiempo === 'todos' || p.tipo_comida === filtroTiempo;
      return coincideTexto && coincideTiempo;
    });
  }, [preparaciones, busquedaBiblioteca, filtroTiempo]);

  const handleGenerar = () => {
    // Tomamos las porciones del almuerzo para generar (podría ser dinámico por tab)
    const porcionesAlmuerzo = distributions.almuerzo || {};
    mutate({
      porciones_disponibles: porcionesAlmuerzo,
      paciente_id: pacienteId || undefined,
      restricciones_dieteticas: Array.from(restriccionesSel),
      alimentos_rechazados: alimentosRechazados.split(',').map(s => s.trim()).filter(Boolean),
      preferencias_texto: preferencias.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white flex-1 overflow-hidden">
      {/* Encabezado */}
      <div className="px-8 py-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-teal-600"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"></path><path d="M6 17h12"></path></svg>
              Generador de Preparaciones
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Biblioteca con {totalPreparaciones} preparaciones · Sugerencia automática según distribución del plan</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 pt-4 bg-white border-b border-gray-100">
          <div className="text-gray-500 h-9 w-fit items-center justify-center rounded-xl p-0.75 flex bg-gray-100">
            <button 
              onClick={() => setActiveTab('generador')}
              className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-xl px-4 py-1 text-sm font-medium transition-all gap-2 ${activeTab === 'generador' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
              Generador Automático
            </button>
            <button 
              onClick={() => setActiveTab('biblioteca')}
              className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-xl px-4 py-1 text-sm font-medium transition-all gap-2 ${activeTab === 'biblioteca' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
              Mi Biblioteca ({totalPreparaciones})
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        {activeTab === 'generador' && (
          <div className="flex gap-0 h-full overflow-hidden">
            {/* Panel Lateral Izquierdo (Controles) */}
            <div className="w-96 border-r border-gray-200 overflow-y-auto bg-gray-50 shrink-0">
              <div className="p-6 space-y-6">
                
                {/* Título de Distribución */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">Plan de distribución</h2>
                  <p className="text-xs text-gray-500">Ingresa las porciones asignadas por tiempo de comida</p>
                </div>

                {/* Tarjeta: Desayuno */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M10 2v2"></path><path d="M14 2v2"></path><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"></path><path d="M6 2v2"></path></svg>
                    <span className="text-sm font-semibold text-gray-800">Desayuno</span>
                    <span className="ml-auto text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full">4 porciones</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <PorcionRow emoji="🌾" nombre="Cereales" color="text-yellow-800" cantidad={1} />
                    <PorcionRow emoji="🍎" nombre="Frutas" color="text-orange-800" cantidad={0} />
                    <PorcionRow emoji="🥦" nombre="Verduras" color="text-green-800" cantidad={0} />
                    <PorcionRow emoji="🥩" nombre="Proteínas" color="text-red-800" cantidad={2} />
                    <PorcionRow emoji="🥑" nombre="Grasas" color="text-blue-800" cantidad={0} />
                    <PorcionRow emoji="🥛" nombre="Lácteos" color="text-purple-800" cantidad={1} />
                  </div>
                </div>

                {/* Tarjeta: Colación AM */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
                    <span className="text-sm font-semibold text-gray-800">Colación AM</span>
                    <span className="ml-auto text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full">2 porciones</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <PorcionRow emoji="🌾" nombre="Cereales" color="text-yellow-800" cantidad={0} />
                    <PorcionRow emoji="🍎" nombre="Frutas" color="text-orange-800" cantidad={0} />
                    <PorcionRow emoji="🥦" nombre="Verduras" color="text-green-800" cantidad={0} />
                    <PorcionRow emoji="🥩" nombre="Proteínas" color="text-red-800" cantidad={1} />
                    <PorcionRow emoji="🥑" nombre="Grasas" color="text-blue-800" cantidad={0} />
                    <PorcionRow emoji="🥛" nombre="Lácteos" color="text-purple-800" cantidad={1} />
                  </div>
                </div>

                {/* Tarjeta: Almuerzo */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M7 21h10"></path><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"></path><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"></path><path d="m13 12 4-4"></path><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"></path></svg>
                    <span className="text-sm font-semibold text-gray-800">Almuerzo</span>
                    <span className="ml-auto text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full">6 porciones</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <PorcionRow emoji="🌾" nombre="Cereales" color="text-yellow-800" cantidad={1} />
                    <PorcionRow emoji="🍎" nombre="Frutas" color="text-orange-800" cantidad={0} />
                    <PorcionRow emoji="🥦" nombre="Verduras" color="text-green-800" cantidad={2} />
                    <PorcionRow emoji="🥩" nombre="Proteínas" color="text-red-800" cantidad={2} />
                    <PorcionRow emoji="🥑" nombre="Grasas" color="text-blue-800" cantidad={1} />
                    <PorcionRow emoji="🥛" nombre="Lácteos" color="text-purple-800" cantidad={0} />
                  </div>
                </div>

                <div className="bg-gray-200 h-px w-full my-4"></div>

                {/* Preferencias del Paciente */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"></path></svg>
                    Preferencias del paciente
                  </h2>
                  <div className="space-y-4">

                    {/* Selector de Paciente */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1.5 block">Paciente (opcional)</label>
                      <select
                        className="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 bg-white text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500 text-gray-700"
                        value={pacienteId}
                        onChange={(e) => handleSeleccionPaciente(e.target.value)}
                      >
                        <option value="">Sin paciente asociado</option>
                        {(pacientes ?? []).map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Al elegir, se precargan sus restricciones (editables solo para esta sesión)</p>
                    </div>

                    {/* Contexto de la ficha del paciente */}
                    {pacienteSeleccionado && (
                      <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 space-y-2">
                        {pacienteSeleccionado.alergias.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-teal-800 uppercase tracking-wide mb-1">Alergias</p>
                            <div className="flex flex-wrap gap-1">
                              {pacienteSeleccionado.alergias.map((a) => (
                                <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">{a}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {pacienteSeleccionado.preferencias_alimentarias.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-teal-800 uppercase tracking-wide mb-1">Preferencias alimentarias</p>
                            <div className="flex flex-wrap gap-1">
                              {pacienteSeleccionado.preferencias_alimentarias.map((p) => (
                                <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-medium">{p}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {pacienteSeleccionado.enfermedades.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-teal-800 uppercase tracking-wide mb-1">Enfermedades</p>
                            <div className="flex flex-wrap gap-1">
                              {pacienteSeleccionado.enfermedades.map((e) => (
                                <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">{e}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {pacienteSeleccionado.alergias.length === 0 &&
                          pacienteSeleccionado.preferencias_alimentarias.length === 0 &&
                          pacienteSeleccionado.enfermedades.length === 0 && (
                            <p className="text-xs text-teal-700">La ficha no registra alergias, preferencias ni enfermedades.</p>
                          )}
                      </div>
                    )}

                    {/* Alimentos Rechazados */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1.5 block">Alimentos no preferidos / rechazados</label>
                      <input 
                        type="text" 
                        className="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 bg-white text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500" 
                        placeholder="Ej: pan, salmón, huevo (separados por coma)" 
                        value={alimentosRechazados}
                        onChange={(e) => setAlimentosRechazados(e.target.value)}
                      />
                      <p className="text-xs text-gray-400 mt-1">Las preparaciones con estos alimentos no aparecerán</p>
                    </div>

                    {/* Restricciones Tags */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-2 block">Restricciones dietéticas</label>
                      <div className="flex flex-wrap gap-1.5">
                        {RESTRICCIONES_DIETETICAS.map((res) => {
                          const activa = restriccionesSel.has(res);
                          return (
                            <button
                              key={res}
                              type="button"
                              aria-pressed={activa}
                              onClick={() => toggleRestriccion(res)}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                activa
                                  ? 'border-teal-600 bg-teal-600 text-white'
                                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {RESTRICCION_LABELS[res]}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">Se excluirán preparaciones con ingredientes incompatibles (según etiquetado de alimentos)</p>
                    </div>

                    {/* Preferencias Extra */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1.5 block">Preferencias adicionales (opcional)</label>
                      <input 
                        type="text" 
                        className="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 bg-white text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500" 
                        placeholder="Ej: prefiere preparaciones rápidas, sin gluten..." 
                        value={preferencias}
                        onChange={(e) => setPreferencias(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Botón Generar */}
                <button 
                  onClick={handleGenerar}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white h-9 px-4 py-2 w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 gap-2 shadow-sm transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                  {isPending ? 'Generando...' : 'Generar Sugerencias'}
                </button>
              </div>
            </div>

            {/* Panel Derecho (Empty State / Resultados) */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {isPending ? (
                <div className="flex items-center justify-center h-full text-teal-600 font-medium">
                  Analizando y generando sugerencias con el motor matemático...
                </div>
              ) : menusGenerados ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-teal-900">Sugerencias Exactas</h3>
                  {menusGenerados.matches_exactos.length === 0 && <p className="text-gray-500 text-sm mb-4">No se encontraron combinaciones exactas.</p>}
                  <div className="space-y-3 mb-8">
                    {menusGenerados.matches_exactos.map(m => (
                       <div key={m.id} className="border p-4 rounded-xl bg-teal-50 border-teal-100 shadow-sm">
                          <h4 className="font-bold text-teal-900">{m.nombre}</h4>
                          <p className="text-xs text-teal-700 mt-1">Ingredientes: {m.ingredientes.map(i => `${i.nombre} (${i.cantidad_g}g)`).join(', ')}</p>
                       </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold mb-4 text-amber-900">Sugerencias Parciales</h3>
                  {menusGenerados.matches_parciales.length === 0 && <p className="text-gray-500 text-sm">No se encontraron combinaciones parciales.</p>}
                  <div className="space-y-3">
                    {menusGenerados.matches_parciales.map(m => (
                       <div key={m.id} className="border p-4 rounded-xl bg-amber-50 border-amber-100 shadow-sm">
                          <h4 className="font-bold text-amber-900">{m.nombre}</h4>
                          <p className="text-xs text-amber-700 mt-1">Ingredientes: {m.ingredientes.map(i => `${i.nombre} (${i.cantidad_g}g)`).join(', ')}</p>
                       </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Configura la distribución del plan</h3>
                  <p className="text-sm text-gray-500 max-w-sm">Ingresa las porciones por grupo de alimento para cada tiempo de comida y el sistema sugerirá preparaciones compatibles automáticamente usando la API.</p>
                  
                  <div className="mt-8 grid grid-cols-3 gap-4 text-left max-w-lg">
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <div className="text-2xl mb-2">1️⃣</div>
                      <p className="text-xs text-gray-600 font-medium">Define porciones por tiempo de comida</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <div className="text-2xl mb-2">2️⃣</div>
                      <p className="text-xs text-gray-600 font-medium">Agrega preferencias del paciente</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <div className="text-2xl mb-2">3️⃣</div>
                      <p className="text-xs text-gray-600 font-medium">Genera sugerencias dinámicamente</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Contenido Pestaña 2: Mi Biblioteca */}
        {activeTab === 'biblioteca' && (
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
            {/* Buscador y Filtros */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-60">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                <input
                  type="text"
                  className="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 bg-white pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  placeholder="Buscar por nombre o ingrediente..."
                  value={busquedaBiblioteca}
                  onChange={(e) => setBusquedaBiblioteca(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-9"
                value={filtroTiempo}
                onChange={(e) => setFiltroTiempo(e.target.value as 'todos' | TipoComida)}
              >
                <option value="todos">Todos los tiempos</option>
                {Object.entries(TIPO_COMIDA_LABELS).map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>{etiqueta}</option>
                ))}
              </select>
              <Link
                to="/biblioteca"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white h-9 px-4 bg-teal-600 hover:bg-teal-700 gap-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                Gestionar en Biblioteca
              </Link>
            </div>

            {/* Tarjetas de Resumen (Métricas) */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Total preparaciones</p>
                <p className="text-2xl font-bold text-gray-900">{totalPreparaciones}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Del sistema</p>
                <p className="text-2xl font-bold text-teal-700">{(preparaciones ?? []).filter(p => p.es_sistema).length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Propias</p>
                <p className="text-2xl font-bold text-sky-700">{(preparaciones ?? []).filter(p => !p.es_sistema).length}</p>
              </div>
            </div>

            {/* Grid de Preparaciones */}
            {cargandoBiblioteca ? (
              <div className="text-center py-16 text-teal-600 font-medium">Cargando preparaciones...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {preparacionesFiltradas.map((receta) => (
                  <div key={receta.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all overflow-hidden flex flex-col">
                    {/* Imagen (si la preparación tiene una) */}
                    {receta.imagen_url && (
                      <img
                        src={receta.imagen_url}
                        alt={receta.nombre}
                        loading="lazy"
                        className="w-full h-28 object-cover"
                      />
                    )}
                    <div className="p-4 flex flex-col flex-1">
                    {/* Título */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-teal-50 text-teal-700">
                            {receta.tipo_comida ? TIPO_COMIDA_LABELS[receta.tipo_comida] : 'Sin clasificar'}
                          </span>
                          {receta.es_sistema && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">Sistema</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{receta.nombre}</h3>
                      </div>
                      <span className="text-xs font-semibold text-gray-700 shrink-0">{Math.round(receta.totales.calorias)} kcal</span>
                    </div>

                    {/* Etiquetas de Ingredientes */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {receta.ingredientes.map((ing) => (
                        <span key={ing.id} title={`${ing.cantidad_g} g`} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-700 border border-gray-100">
                          {ing.nombre}
                        </span>
                      ))}
                    </div>

                    {/* Descripción */}
                    {receta.descripcion && (
                      <p className="text-xs text-gray-500 mt-3 line-clamp-2 flex-1">{receta.descripcion}</p>
                    )}
                    </div>
                  </div>
                ))}
                {preparacionesFiltradas.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">No se encontraron preparaciones</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};