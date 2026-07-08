import React, { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, Check, ChevronDown, ChevronUp, Info, Plus, X } from 'lucide-react';
import { useGenerarMenu } from '../../menus/hooks/useMenus';
import type { RecetaOut } from '../../menus/types/menu.types';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { usePortionsStore } from '../../porciones/store/usePortionsStore';
import { usePreparaciones } from '../../preparaciones/hooks/usePreparaciones';
import { usePacientes } from '../../pacientes/hooks/usePacientes';
import { useBuscarAlimentos } from '../../alimentos/hooks/useBuscarAlimentos';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { TIPO_COMIDA_LABELS, type TipoComida } from '../../preparaciones/types/preparacion.types';
import { MEALS, NUTRITION_GROUPS } from '../../porciones/constants';
import { traducirPorcionesParaMath, GRUPO_A_MATH } from '../../porciones/gruposMath';
import {
  RESTRICCIONES_DIETETICAS,
  RESTRICCION_LABELS,
  derivarRestriccionesDePaciente,
  type RestriccionDietetica,
} from '../constants/restricciones';

// Etiqueta + color de cada grupo de intercambio, para mostrar la distribución real.
const GRUPO_INFO: Record<string, { label: string; emoji: string; color: string }> = Object.fromEntries(
  (NUTRITION_GROUPS as Array<{ id: string; label: string; emoji: string; textBtn: string }>).map((g) => [
    g.id,
    { label: g.label, emoji: g.emoji, color: g.textBtn },
  ]),
);

// Clave de backend-math -> id corto de grupo, para etiquetar porciones requeridas.
const MATH_A_GRUPO: Record<string, string> = Object.fromEntries(
  Object.entries(GRUPO_A_MATH).map(([corto, math]) => [math, corto]),
);

// Tiempo de comida de la pauta -> tipo_comida del catálogo de preparaciones.
// Los tiempos sin equivalente (once, comidas personalizadas) no filtran por tipo.
const COMIDA_A_TIPO: Record<string, TipoComida | undefined> = {
  desayuno: 'desayuno',
  colacion_am: 'colacion',
  almuerzo: 'almuerzo',
  colacion_pm: 'colacion',
  once: undefined,
  cena: 'cena',
};

// Fila de solo lectura que muestra las porciones reales asignadas a un grupo.
const PorcionRow = ({ grupoId, cantidad }: { grupoId: string; cantidad: number }) => {
  const info = GRUPO_INFO[grupoId] ?? { label: grupoId, emoji: '•', color: 'text-ink' };
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs font-medium ${info.color}`}>{info.emoji} {info.label}</span>
      <span className="text-sm font-medium text-ink tnum tabular-nums">{cantidad}</span>
    </div>
  );
};

/** Etiqueta legible de una clave de porciones de backend-math. */
const etiquetaGrupoMath = (claveMath: string): string => {
  const corto = MATH_A_GRUPO[claveMath];
  const info = corto ? GRUPO_INFO[corto] : undefined;
  return info ? `${info.emoji} ${info.label}` : claveMath.replace(/_/g, ' ');
};

/** Tarjeta de una sugerencia del generador, con detalle expandible y acción de pauta. */
const SugerenciaCard = ({
  receta,
  variante,
  enPauta,
  hayRestricciones,
  onUsarEnPauta,
}: {
  receta: RecetaOut;
  variante: 'exacto' | 'parcial';
  enPauta: boolean;
  hayRestricciones: boolean;
  onUsarEnPauta: (receta: RecetaOut) => void;
}) => {
  const [abierta, setAbierta] = useState(false);
  const esExacto = variante === 'exacto';
  const ingredientesSinEtiquetar = hayRestricciones
    ? receta.ingredientes.filter((i) => i.sin_etiquetar)
    : [];

  return (
    <div className={`border rounded-card shadow-sm overflow-hidden ${esExacto ? 'bg-pine-soft/5 border-pine-soft/20' : 'bg-white border-mist'}`}>
      <div className="flex gap-3 p-4">
        {receta.imagen_url && (
          <img
            src={receta.imagen_url}
            alt={receta.nombre}
            loading="lazy"
            className="w-16 h-16 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {receta.tipo_comida && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-pine-soft/10 text-pine-soft">
                {TIPO_COMIDA_LABELS[receta.tipo_comida]}
              </span>
            )}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold tnum ${esExacto ? 'bg-pine text-white' : 'bg-apricot/25 text-[#8a5a2a]'}`}
              title="Porcentaje de las porciones de esta comida que la preparación utiliza"
            >
              Cubre {Math.round(receta.cobertura)}%
            </span>
            <span className="text-[10px] text-ink-soft font-medium ml-auto tnum shrink-0">
              {Math.round(receta.calorias_totales)} kcal
            </span>
          </div>
          <h4 className={`font-bold text-sm truncate ${esExacto ? 'text-pine-soft' : 'text-ink'}`}>{receta.nombre}</h4>
          <p className="text-xs text-ink-soft mt-1 line-clamp-2">
            {receta.ingredientes.map((i) => `${i.nombre} (${i.cantidad_g}g)`).join(', ')}
          </p>
          {ingredientesSinEtiquetar.length > 0 && (
            <p className="text-[11px] text-[#8a5a2a] mt-1.5 flex items-start gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
              <span>
                Sin etiquetas de restricción: {ingredientesSinEtiquetar.map((i) => i.nombre).join(', ')}. Verifica compatibilidad manualmente.
              </span>
            </p>
          )}
        </div>
      </div>

      {abierta && (
        <div className="px-4 pb-4 space-y-3 border-t border-mist/60 pt-3">
          {receta.descripcion && (
            <p className="text-xs text-ink-soft">{receta.descripcion}</p>
          )}
          {receta.instrucciones && (
            <div>
              <p className="text-[10px] font-semibold text-ink-soft uppercase tracking-wide mb-1">Instrucciones</p>
              <p className="text-xs text-ink whitespace-pre-line">{receta.instrucciones}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold text-ink-soft uppercase tracking-wide mb-1">Porciones que utiliza</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(receta.porciones_requeridas).map(([grupo, cant]) => (
                <span key={grupo} className="text-[11px] px-2 py-0.5 rounded bg-porcelain border border-mist/70 text-ink-soft tnum">
                  {etiquetaGrupoMath(grupo)}: <span className="font-semibold text-ink">{cant}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/60 border-t border-mist/60">
        <button
          type="button"
          onClick={() => setAbierta((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink transition-colors"
        >
          {abierta ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {abierta ? 'Ocultar detalle' : 'Ver detalle'}
        </button>
        <button
          type="button"
          onClick={() => onUsarEnPauta(receta)}
          disabled={enPauta}
          className={`ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
            enPauta
              ? 'bg-pine-soft/10 text-pine-soft cursor-default'
              : 'bg-pine text-white hover:bg-pine-soft'
          }`}
        >
          {enPauta ? (
            <>
              <Check className="w-3.5 h-3.5" /> En la pauta
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> Usar en pauta
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const GeneradorPreparaciones: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generador');

  // Alimentos rechazados como chips, con autocomplete contra el catálogo real.
  const [rechazados, setRechazados] = useState<string[]>([]);
  const [rechazadoInput, setRechazadoInput] = useState('');
  const rechazadoDebounced = useDebouncedValue(rechazadoInput, 300);
  const { data: sugerenciasAlimentos } = useBuscarAlimentos({
    search: rechazadoDebounced,
    categoria: null,
  });

  const [busquedaBiblioteca, setBusquedaBiblioteca] = useState('');
  const [filtroTiempo, setFiltroTiempo] = useState<'todos' | TipoComida>('todos');

  const { distributions, activeMeals, sugerenciasComida, addSugerenciaComida } = usePortionsStore();
  const { mutate, data: menusGenerados, isPending, isError } = useGenerarMenu();
  const { data: preparaciones, isLoading: cargandoBiblioteca } = usePreparaciones();
  const { data: pacientes } = usePacientes();
  const activePatient = useClinicalStore((s) => s.activePatient);

  const comidasDisponibles = useMemo(
    () => MEALS.filter((m) => activeMeals.includes(m.id)),
    [activeMeals],
  );

  // Comida sobre la que se generan las sugerencias (sus porciones alimentan al
  // motor). Parte en la primera comida activa; si la seleccionada deja de estar
  // activa, se usa la primera disponible (derivado, sin efecto corrector).
  const [comidaSeleccionada, setComidaSeleccionada] = useState(
    () => comidasDisponibles.find((m) => m.id === 'almuerzo')?.id ?? comidasDisponibles[0]?.id ?? 'almuerzo',
  );
  const comidaGenerar = comidasDisponibles.some((m) => m.id === comidaSeleccionada)
    ? comidaSeleccionada
    : comidasDisponibles[0]?.id ?? comidaSeleccionada;

  // El generador trabaja SIEMPRE con el paciente activo: las porciones vienen
  // de su pauta (Distribución de Porciones), así que no tiene sentido generar
  // para otro paciente. Su ficha completa se busca en el listado.
  const pacienteSeleccionado = useMemo(
    () => (pacientes ?? []).find((p) => p.id === activePatient?.id),
    [pacientes, activePatient?.id],
  );

  // Restricciones: se derivan de la ficha del paciente activo y la nutricionista
  // puede editarlas solo para esta sesión (override por paciente; nunca se
  // escribe de vuelta en la ficha). Al cambiar de paciente activo, el override
  // deja de aplicar y vuelven las derivadas — sin efectos correctores.
  const restriccionesDerivadas = useMemo(
    () =>
      new Set<RestriccionDietetica>(
        pacienteSeleccionado
          ? derivarRestriccionesDePaciente([
              ...pacienteSeleccionado.alergias,
              ...pacienteSeleccionado.preferencias_alimentarias,
            ])
          : [],
      ),
    [pacienteSeleccionado],
  );
  const [restriccionesOverride, setRestriccionesOverride] = useState<{
    pacienteId: string | null;
    seleccion: Set<RestriccionDietetica>;
  } | null>(null);
  const restriccionesSel =
    restriccionesOverride && restriccionesOverride.pacienteId === (pacienteSeleccionado?.id ?? null)
      ? restriccionesOverride.seleccion
      : restriccionesDerivadas;

  const toggleRestriccion = (restriccion: RestriccionDietetica) => {
    const siguiente = new Set(restriccionesSel);
    if (siguiente.has(restriccion)) siguiente.delete(restriccion);
    else siguiente.add(restriccion);
    setRestriccionesOverride({
      pacienteId: pacienteSeleccionado?.id ?? null,
      seleccion: siguiente,
    });
  };

  const agregarRechazado = (valor: string) => {
    const limpio = valor.trim();
    if (!limpio) return;
    setRechazados((prev) =>
      prev.some((r) => r.toLowerCase() === limpio.toLowerCase()) ? prev : [...prev, limpio],
    );
    setRechazadoInput('');
  };

  const quitarRechazado = (valor: string) => {
    setRechazados((prev) => prev.filter((r) => r !== valor));
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

  // Porciones reales asignadas a la comida elegida (desde Distribución de Porciones),
  // descartando los grupos en 0 para no mostrar ruido.
  const porcionesComida = useMemo(() => {
    const dist = distributions[comidaGenerar] || {};
    return Object.entries(dist).filter(([, cant]) => cant > 0) as Array<[string, number]>;
  }, [distributions, comidaGenerar]);

  const tienePorciones = porcionesComida.length > 0;
  const tipoComidaGenerar = COMIDA_A_TIPO[comidaGenerar];
  const nombreComidaGenerar = MEALS.find((m) => m.id === comidaGenerar)?.name ?? 'la comida';
  const idsEnPauta = useMemo(
    () => new Set((sugerenciasComida[comidaGenerar] || []).map((s) => s.id)),
    [sugerenciasComida, comidaGenerar],
  );

  const handleGenerar = () => {
    // Traducimos los ids de grupo del frontend a las claves que espera backend-math.
    const porcionesDisponibles = traducirPorcionesParaMath(
      distributions[comidaGenerar] || {},
    );
    mutate({
      porciones_disponibles: porcionesDisponibles,
      tipo_comida: tipoComidaGenerar,
      paciente_id: activePatient?.id || undefined,
      restricciones_dieteticas: Array.from(restriccionesSel),
      alimentos_rechazados: rechazados,
    });
  };

  const handleUsarEnPauta = (receta: RecetaOut) => {
    addSugerenciaComida(comidaGenerar, {
      id: receta.id,
      nombre: receta.nombre,
      ingredientes: receta.ingredientes.map((i) => `${i.nombre} (${i.cantidad_g}g)`).join(', '),
    });
  };

  return (
    <div className="flex flex-col h-full bg-white flex-1 overflow-hidden">
      {/* Encabezado */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-mist bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-pine-soft"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"></path><path d="M6 17h12"></path></svg>
              Generador de Preparaciones
            </h1>
            <p className="text-sm text-ink-soft mt-0.5">Biblioteca con {totalPreparaciones} preparaciones · Sugerencia automática según distribución del plan</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 sm:px-8 pt-4 bg-white border-b border-mist/70">
          <div className="text-ink-soft h-9 w-fit items-center justify-center rounded-card p-0.75 flex bg-mist/60">
            <button
              onClick={() => setActiveTab('generador')}
              className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-card px-4 py-1 text-sm font-medium transition-all gap-2 ${activeTab === 'generador' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink-soft'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
              Generador Automático
            </button>
            <button
              onClick={() => setActiveTab('biblioteca')}
              className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-card px-4 py-1 text-sm font-medium transition-all gap-2 ${activeTab === 'biblioteca' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink-soft'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
              Mi Biblioteca ({totalPreparaciones})
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        {activeTab === 'generador' && (
          <div className="flex flex-col md:flex-row h-full overflow-auto md:overflow-hidden">
            {/* Panel Lateral Izquierdo (Controles) */}
            <div className="w-full md:w-96 border-b md:border-b-0 md:border-r border-mist overflow-y-auto bg-porcelain md:shrink-0">
              <div className="p-6 space-y-6">

                {/* Selector de comida + porciones reales */}
                <div>
                  <h2 className="text-sm font-semibold text-ink mb-1">Plan de distribución</h2>
                  <p className="text-xs text-ink-soft mb-3">Las porciones provienen de Distribución de Porciones</p>

                  <label className="text-xs font-medium text-ink-soft mb-1.5 block">Generar para</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-mist px-3 py-1 bg-white text-sm outline-none focus-visible:ring-2 focus-visible:ring-pine-soft text-ink"
                    value={comidaGenerar}
                    onChange={(e) => setComidaSeleccionada(e.target.value)}
                  >
                    {comidasDisponibles.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-ink-soft/60 mt-1">
                    {tipoComidaGenerar
                      ? `Solo se sugieren preparaciones de tipo ${TIPO_COMIDA_LABELS[tipoComidaGenerar]} (y sin clasificar)`
                      : 'Este tiempo de comida no filtra por tipo de preparación'}
                  </p>
                </div>

                {/* Porciones reales de la comida seleccionada */}
                <div className="bg-white rounded-card border border-mist overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-mist/70">
                    <span className="text-sm font-semibold text-ink">
                      {MEALS.find((m) => m.id === comidaGenerar)?.name ?? 'Comida'}
                    </span>
                    <span className="ml-auto text-xs text-pine-soft font-medium bg-pine-soft/5 px-2 py-0.5 rounded-full tnum">
                      {porcionesComida.reduce((acc, [, c]) => acc + c, 0)} porciones
                    </span>
                  </div>
                  {tienePorciones ? (
                    <div className="p-3 space-y-2">
                      {porcionesComida.map(([grupoId, cantidad]) => (
                        <PorcionRow key={grupoId} grupoId={grupoId} cantidad={cantidad} />
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs text-ink-soft mb-2">
                        No has asignado porciones a esta comida.
                      </p>
                      <Link to="/porciones" className="text-xs font-semibold text-pine-soft hover:underline">
                        Ir a Distribución de Porciones →
                      </Link>
                    </div>
                  )}
                </div>

                <div className="bg-mist h-px w-full my-4"></div>

                {/* Preferencias del Paciente */}
                <div>
                  <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pine-soft"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"></path></svg>
                    Preferencias del paciente
                  </h2>
                  <div className="space-y-4">

                    {/* Paciente activo (las porciones provienen de SU pauta) */}
                    <div>
                      <label className="text-xs font-medium text-ink-soft mb-1.5 block">Paciente activo</label>
                      {pacienteSeleccionado ? (
                        <>
                          <div className="flex h-9 w-full items-center rounded-md border border-mist px-3 bg-white text-sm text-ink font-medium">
                            {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                          </div>
                          <p className="text-xs text-ink-soft/60 mt-1">Sus restricciones se precargan desde la ficha (editables solo para esta sesión)</p>
                        </>
                      ) : (
                        <div className="rounded-md border border-dashed border-mist bg-white px-3 py-2.5">
                          <p className="text-xs text-ink-soft">
                            No hay paciente activo. Actívalo desde{' '}
                            <Link to="/pacientes" className="font-semibold text-pine-soft hover:underline">Pacientes</Link>{' '}
                            para precargar sus restricciones.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Contexto de la ficha del paciente */}
                    {pacienteSeleccionado && (
                      <div className="bg-pine-soft/5 border border-pine-soft/20 rounded-lg p-3 space-y-2">
                        {pacienteSeleccionado.alergias.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-pine-soft uppercase tracking-wide mb-1">Alergias</p>
                            <div className="flex flex-wrap gap-1">
                              {pacienteSeleccionado.alergias.map((a) => (
                                <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-clinical-red/10 text-clinical-red font-medium">{a}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {pacienteSeleccionado.preferencias_alimentarias.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-pine-soft uppercase tracking-wide mb-1">Preferencias alimentarias</p>
                            <div className="flex flex-wrap gap-1">
                              {pacienteSeleccionado.preferencias_alimentarias.map((p) => (
                                <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-pine-soft/10 text-pine-soft font-medium">{p}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {pacienteSeleccionado.enfermedades.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-pine-soft uppercase tracking-wide mb-1">Enfermedades</p>
                            <div className="flex flex-wrap gap-1">
                              {pacienteSeleccionado.enfermedades.map((e) => (
                                <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-apricot/20 text-[#8a5a2a] font-medium">{e}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {pacienteSeleccionado.alergias.length === 0 &&
                          pacienteSeleccionado.preferencias_alimentarias.length === 0 &&
                          pacienteSeleccionado.enfermedades.length === 0 && (
                            <p className="text-xs text-pine-soft">La ficha no registra alergias, preferencias ni enfermedades.</p>
                          )}
                      </div>
                    )}

                    {/* Alimentos Rechazados (chips + autocomplete del catálogo) */}
                    <div>
                      <label htmlFor="rechazado-input" className="text-xs font-medium text-ink-soft mb-1.5 block">Alimentos no preferidos / rechazados</label>
                      {rechazados.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {rechazados.map((r) => (
                            <span key={r} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-clinical-red/10 text-clinical-red font-medium">
                              {r}
                              <button
                                type="button"
                                onClick={() => quitarRechazado(r)}
                                aria-label={`Quitar ${r}`}
                                className="hover:opacity-70"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <input
                        id="rechazado-input"
                        type="text"
                        list="alimentos-catalogo"
                        className="flex h-9 w-full rounded-md border border-mist px-3 py-1 bg-white text-sm outline-none focus-visible:ring-2 focus-visible:ring-pine-soft"
                        placeholder="Escribe y presiona Enter (ej: pan, salmón)"
                        value={rechazadoInput}
                        onChange={(e) => setRechazadoInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            agregarRechazado(rechazadoInput);
                          }
                        }}
                        onBlur={() => agregarRechazado(rechazadoInput)}
                      />
                      <datalist id="alimentos-catalogo">
                        {(sugerenciasAlimentos?.items ?? []).map((a) => (
                          <option key={a.id} value={a.nombre} />
                        ))}
                      </datalist>
                      <p className="text-xs text-ink-soft/60 mt-1">Las preparaciones con estos alimentos no aparecerán</p>
                    </div>

                    {/* Restricciones Tags */}
                    <div>
                      <label className="text-xs font-medium text-ink-soft mb-2 block">Restricciones dietéticas</label>
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
                                  ? 'border-pine bg-pine text-white'
                                  : 'border-mist text-ink-soft hover:bg-porcelain'
                              }`}
                            >
                              {RESTRICCION_LABELS[res]}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-ink-soft/60 mt-1.5">Se excluirán preparaciones con ingredientes incompatibles (según etiquetado de alimentos)</p>
                      {restriccionesSel.size > 0 && (
                        <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-apricot/15 border border-apricot/40 px-2.5 py-2" role="note">
                          <Info className="w-3.5 h-3.5 text-[#8a5a2a] shrink-0 mt-px" />
                          <p className="text-[11px] text-[#8a5a2a]">
                            El filtrado depende del etiquetado del catálogo: los alimentos sin etiquetas no se pueden evaluar y se marcarán en cada sugerencia. Valida siempre la sugerencia final.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botón Generar */}
                <button
                  onClick={handleGenerar}
                  disabled={isPending || !tienePorciones}
                  title={!tienePorciones ? 'Asigna porciones a esta comida en Distribución de Porciones' : undefined}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white h-9 px-4 py-2 w-full bg-pine hover:bg-pine-soft disabled:opacity-50 disabled:cursor-not-allowed gap-2 shadow-sm transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                  {isPending ? 'Generando...' : 'Generar Sugerencias'}
                </button>
                {!tienePorciones && (
                  <p className="text-xs text-ink-soft/70 text-center mt-2">
                    Primero asigna porciones a esta comida.
                  </p>
                )}
              </div>
            </div>

            {/* Panel Derecho (Empty State / Resultados) */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {isPending ? (
                <div className="flex items-center justify-center h-full text-pine-soft font-medium">
                  Analizando y generando sugerencias con el motor matemático...
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20" role="alert">
                  <div className="w-16 h-16 rounded-card bg-clinical-red/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-clinical-red" />
                  </div>
                  <h3 className="text-lg font-semibold text-ink mb-2">No se pudieron generar las sugerencias</h3>
                  <p className="text-sm text-ink-soft max-w-sm mb-6">
                    El motor matemático no respondió correctamente. Puede ser una caída temporal del servicio.
                  </p>
                  <button
                    onClick={handleGenerar}
                    disabled={!tienePorciones}
                    className="px-6 py-2.5 bg-pine hover:bg-pine-soft disabled:opacity-60 text-porcelain font-medium rounded-md transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              ) : menusGenerados ? (
                <div>
                  {idsEnPauta.size > 0 && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-pine-soft/5 border border-pine-soft/20 px-3 py-2">
                      <Check className="w-4 h-4 text-pine-soft shrink-0" />
                      <p className="text-xs text-pine-soft">
                        {idsEnPauta.size} sugerencia(s) agregada(s) a {nombreComidaGenerar}. Se guardan con la pauta en{' '}
                        <Link to="/porciones" className="font-semibold underline">Distribución de Porciones</Link>.
                      </p>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold mb-1 text-pine-soft">Sugerencias Exactas</h3>
                  <p className="text-xs text-ink-soft mb-4">Usan (casi) todas las porciones de {nombreComidaGenerar}, ordenadas por cobertura.</p>
                  {menusGenerados.matches_exactos.length === 0 && <p className="text-ink-soft text-sm mb-4">No se encontraron combinaciones exactas.</p>}
                  <div className="space-y-3 mb-8">
                    {menusGenerados.matches_exactos.map(m => (
                      <SugerenciaCard
                        key={m.id}
                        receta={m}
                        variante="exacto"
                        enPauta={idsEnPauta.has(m.id)}
                        hayRestricciones={restriccionesSel.size > 0}
                        onUsarEnPauta={handleUsarEnPauta}
                      />
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold mb-1 text-[#8a5a2a]">Sugerencias Parciales</h3>
                  <p className="text-xs text-ink-soft mb-4">Caben en el plan pero dejan porciones sin usar; combínalas o complementa.</p>
                  {menusGenerados.matches_parciales.length === 0 && <p className="text-ink-soft text-sm">No se encontraron combinaciones parciales.</p>}
                  <div className="space-y-3">
                    {menusGenerados.matches_parciales.map(m => (
                      <SugerenciaCard
                        key={m.id}
                        receta={m}
                        variante="parcial"
                        enPauta={idsEnPauta.has(m.id)}
                        hayRestricciones={restriccionesSel.size > 0}
                        onUsarEnPauta={handleUsarEnPauta}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-20 h-20 rounded-card bg-pine-soft/5 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pine-soft/60"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-ink-soft mb-2">Configura la distribución del plan</h3>
                  <p className="text-sm text-ink-soft max-w-sm">Ingresa las porciones por grupo de alimento para cada tiempo de comida y el sistema sugerirá preparaciones compatibles automáticamente usando la API.</p>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-lg w-full">
                    <div className="bg-porcelain rounded-card p-4 text-center border border-mist/70">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-pine-soft/10 text-pine-soft font-semibold flex items-center justify-center tnum">1</div>
                      <p className="text-xs text-ink-soft font-medium">Define porciones por tiempo de comida</p>
                    </div>
                    <div className="bg-porcelain rounded-card p-4 text-center border border-mist/70">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-pine-soft/10 text-pine-soft font-semibold flex items-center justify-center tnum">2</div>
                      <p className="text-xs text-ink-soft font-medium">Agrega preferencias del paciente</p>
                    </div>
                    <div className="bg-porcelain rounded-card p-4 text-center border border-mist/70">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-pine-soft/10 text-pine-soft font-semibold flex items-center justify-center tnum">3</div>
                      <p className="text-xs text-ink-soft font-medium">Genera y ancla sugerencias a la pauta</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Contenido Pestaña 2: Mi Biblioteca */}
        {activeTab === 'biblioteca' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 bg-porcelain">
            {/* Buscador y Filtros */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center w-full mb-6">
              <div className="relative flex-1 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                <input
                  type="text"
                  className="flex h-9 w-full rounded-md border border-mist px-3 py-1 bg-white pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-pine-soft"
                  placeholder="Buscar por nombre o ingrediente..."
                  value={busquedaBiblioteca}
                  onChange={(e) => setBusquedaBiblioteca(e.target.value)}
                />
              </div>
              <select
                className="border border-mist rounded-lg px-3 py-1.5 text-sm text-ink-soft bg-white focus:outline-none focus:ring-2 focus:ring-pine-soft h-9 w-full md:w-auto"
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
                className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white h-9 px-4 bg-pine hover:bg-pine-soft gap-2 transition-colors w-full md:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                Gestionar en Biblioteca
              </Link>
            </div>

            {/* Tarjetas de Resumen (Métricas) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-card border border-mist p-4 shadow-sm">
                <p className="text-xs text-ink-soft mb-1">Total preparaciones</p>
                <p className="text-2xl font-bold text-ink">{totalPreparaciones}</p>
              </div>
              <div className="bg-white rounded-card border border-mist p-4 shadow-sm">
                <p className="text-xs text-ink-soft mb-1">Del sistema</p>
                <p className="text-2xl font-bold text-pine-soft">{(preparaciones ?? []).filter(p => p.es_sistema).length}</p>
              </div>
              <div className="bg-white rounded-card border border-mist p-4 shadow-sm">
                <p className="text-xs text-ink-soft mb-1">Propias</p>
                <p className="text-2xl font-bold text-sky-700">{(preparaciones ?? []).filter(p => !p.es_sistema).length}</p>
              </div>
            </div>

            {/* Grid de Preparaciones */}
            {cargandoBiblioteca ? (
              <div className="text-center py-16 text-pine-soft font-medium">Cargando preparaciones...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {preparacionesFiltradas.map((receta) => (
                  <div key={receta.id} className="bg-white rounded-card border border-mist hover:shadow-md transition-all overflow-hidden flex flex-col">
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
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-pine-soft/5 text-pine-soft">
                            {receta.tipo_comida ? TIPO_COMIDA_LABELS[receta.tipo_comida] : 'Sin clasificar'}
                          </span>
                          {receta.es_sistema && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-mist/60 text-ink-soft">Sistema</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-ink text-sm truncate">{receta.nombre}</h3>
                      </div>
                      <span className="text-xs font-semibold text-ink-soft shrink-0">{Math.round(receta.totales.calorias)} kcal</span>
                    </div>

                    {/* Etiquetas de Ingredientes */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {receta.ingredientes.map((ing) => (
                        <span key={ing.id} title={`${ing.cantidad_g} g`} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-porcelain text-ink-soft border border-mist/70">
                          {ing.nombre}
                        </span>
                      ))}
                    </div>

                    {/* Descripción */}
                    {receta.descripcion && (
                      <p className="text-xs text-ink-soft mt-3 line-clamp-2 flex-1">{receta.descripcion}</p>
                    )}
                    </div>
                  </div>
                ))}
                {preparacionesFiltradas.length === 0 && (
                  <div className="col-span-full text-center py-12 text-ink-soft">No se encontraron preparaciones</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
