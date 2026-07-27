import { useState } from "react";
import {
  LayoutGrid,
  FileText,
  BookOpen,
  Download,
  RefreshCw,
  Save,
  Loader2,
  Check,
  Plus,
  AlertTriangle,
  Maximize2,
  X,
} from "lucide-react";
import { usePortions } from "../../features/porciones/hooks/usePortions";
import { PortionsTable } from "../../features/porciones/components/PortionsTable";
import { VistaPauta } from "../../features/porciones/components/VistaPauta";
import { OpcionesPorGrupo } from "../../features/porciones/components/OpcionesPorGrupo";
import { ExportarPDF } from "../../features/porciones/components/ExportarPDF";
import { PortionsConfigPanel } from "../../features/porciones/components/PortionsConfigPanel";
import { SavePautaModal } from "../../features/porciones/components/SavePautaModal";
import { FlowStepper } from "../../shared/ui/organisms/FlowStepper";
import { PlanificacionSelector } from "../../features/planificaciones/components/PlanificacionSelector";

const TAB_CONFIG = {
  tabla: {
    title: "Distribución de Porciones",
    desc: "Para una mejor experiencia táctil, la tabla se abrirá en pantalla completa.",
    btn: "Abrir Tabla",
  },
  pauta: {
    title: "Vista de Pauta",
    desc: "Para mayor comodidad en la lectura, la pauta se abrirá en pantalla completa.",
    btn: "Abrir Pauta",
  },
  opciones: {
    title: "Opciones por Grupo",
    desc: "Configura las opciones de alimentos en pantalla completa.",
    btn: "Abrir Opciones",
  },
  pdf: {
    title: "Exportar PDF",
    desc: "Genera y previsualiza el PDF en pantalla completa.",
    btn: "Abrir Exportador",
  },
};

export const PorcionesPage = () => {
  const { state, actions } = usePortions();
  const {
    activeTab,
    isSaving,
    hayPacienteActivo,
    hayPlanificacionActiva,
    pautas,
    selectedPautaId,
    pautaSeleccionada,
    nombrePautaSugerido,
    dirty,
  } = state;
  const {
    setActiveTab,
    resetDistributions,
    guardarPauta,
    seleccionarPauta,
    nuevaPauta,
  } = actions;

  const [aviso, setAviso] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const renderContent = () => {
    let Component = null;
    let Icon = null;
    const config = TAB_CONFIG[activeTab as keyof typeof TAB_CONFIG];

    if (activeTab === "tabla") {
      Component = PortionsTable;
      Icon = LayoutGrid;
    } else if (activeTab === "pauta") {
      Component = VistaPauta;
      Icon = FileText;
    } else if (activeTab === "opciones") {
      Component = OpcionesPorGrupo;
      Icon = BookOpen;
    } else if (activeTab === "pdf") {
      Component = ExportarPDF;
      Icon = Download;
    }

    if (!Component || !Icon || !config) return null;

    return (
      <>
        <div className="hidden md:block h-full">
          <Component />
        </div>

        <div className="flex md:hidden flex-col items-center justify-center h-full p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-pine/10 text-pine rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-ink text-lg">{config.title}</h3>
            <p className="text-sm text-ink-soft mt-1">{config.desc}</p>
          </div>
          <button
            onClick={() => setIsFullscreen(true)}
            className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 min-h-12 bg-pine text-white rounded-xl font-semibold shadow-sm hover:bg-pine-soft active:scale-95 transition-all"
          >
            <Maximize2 className="w-4 h-4" />
            {config.btn}
          </button>
        </div>

        {isFullscreen && (
          <div className="fixed inset-0 z-100 bg-porcelain flex flex-col md:hidden animate-in fade-in duration-200">
            <div className="bg-white px-4 py-3 border-b border-mist shadow-sm flex items-center justify-between shrink-0 sticky top-0 z-10">
              <h3 className="font-bold text-ink">{config.title}</h3>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2.5 min-w-11 min-h-11 flex items-center justify-center text-ink-soft hover:bg-mist rounded-full transition-colors active:scale-95"
                aria-label="Cerrar vista a pantalla completa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 pb-24">
              <Component />
            </div>
          </div>
        )}
      </>
    );
  };

  const puedeGuardar = hayPacienteActivo && hayPlanificacionActiva;
  const tituloGuardar = !hayPacienteActivo
    ? "Selecciona un paciente activo primero"
    : !hayPlanificacionActiva
      ? "Crea una planificación de macronutrientes antes de guardar la pauta"
      : undefined;

  const handleGuardar = async (nombre: string) => {
    const resultado = await guardarPauta(nombre);
    setAviso(resultado);
    setModalOpen(false);
    if (resultado.ok) setTimeout(() => setAviso(null), 4000);
  };

  const onSelectorChange = (value: string) => {
    if (value === "nueva") {
      nuevaPauta();
      return;
    }
    // Cargar otra pauta descarta los cambios locales: pedir confirmación.
    if (
      dirty &&
      !window.confirm(
        "Tienes cambios sin guardar que se perderán al cargar otra pauta. ¿Continuar?",
      )
    ) {
      return;
    }
    seleccionarPauta(value);
  };

  return (
    <div className="p-3 sm:p-4 max-w-350 mx-auto w-full flex flex-col h-full">
      <SavePautaModal
        open={modalOpen}
        defaultName={pautaSeleccionada?.nombre || nombrePautaSugerido}
        isEditing={!!selectedPautaId}
        isSaving={isSaving}
        onClose={() => setModalOpen(false)}
        onConfirm={handleGuardar}
      />

      <FlowStepper current={3} />

      <div className="bg-white rounded-t-card border border-mist border-b-0 px-3 sm:px-6 py-3 sm:py-4 shrink-0">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between lg:items-center lg:gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink">
              Distribución de Porciones
            </h1>
            <p className="text-xs text-ink-soft mt-1">
              Configura y ajusta la pauta nutricional del paciente activo.
            </p>
            <div className="mt-2">
              <PlanificacionSelector />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 lg:gap-2.5 md:justify-end 2xl:flex-nowrap">
            {/* Guardar pauta: siempre visible y prominente — primero en mobile */}
            <button
              onClick={() => setModalOpen(true)}
              disabled={isSaving || !puedeGuardar}
              title={tituloGuardar}
              className="col-span-2 sm:col-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-lg text-xs font-semibold bg-pine hover:bg-pine-soft text-porcelain transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-first sm:order-last shrink-0 whitespace-nowrap"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : (
                <Save className="w-3.5 h-3.5 shrink-0" />
              )}
              {isSaving ? "Guardando..." : "Guardar pauta"}
            </button>
            {dirty && (
              <span className="col-span-2 sm:col-auto inline-flex items-center justify-center gap-1 text-[10px] font-semibold text-[#8a5a2a] bg-apricot/10 border border-apricot/40 rounded-md px-2 py-1 shrink-0 whitespace-nowrap">
                <AlertTriangle className="w-3 h-3 shrink-0" /> Cambios sin guardar
              </span>
            )}
            {/* Selector de pautas de la planificación activa */}
            <select
              value={selectedPautaId ?? "nueva"}
              onChange={(e) => onSelectorChange(e.target.value)}
              disabled={!puedeGuardar}
              aria-label="Pauta"
              className="col-span-2 sm:col-auto pl-3 pr-8 py-2 sm:py-1.5 rounded-lg border border-mist bg-white text-xs text-ink font-medium outline-none focus:border-pine-soft disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:max-w-45 shrink-0 truncate"
            >
              {pautas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre || "Pauta sin nombre"}
                </option>
              ))}
              {!selectedPautaId && (
                <option value="nueva">Pauta nueva (sin guardar)</option>
              )}
            </select>
            <button
              onClick={nuevaPauta}
              disabled={!puedeGuardar}
              title="Empezar una pauta nueva"
              className="col-span-1 sm:col-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg border text-xs transition-colors bg-white border-mist text-ink-soft hover:bg-porcelain font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" /> Nueva
            </button>
            <button
              onClick={resetDistributions}
              className="col-span-1 sm:col-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg border text-xs transition-colors bg-white border-mist text-ink-soft hover:bg-porcelain font-medium w-full sm:w-auto shrink-0 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" /> Restablecer
            </button>
            <div className="col-span-2 sm:col-auto w-full sm:w-auto flex shrink-0">
              <PortionsConfigPanel />
            </div>
          </div>
        </div>

        {/* P7: aviso si el paciente no tiene planificación de macros activa */}
        {hayPacienteActivo && !hayPlanificacionActiva && (
          <div
            className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-md border bg-apricot/10 border-apricot/40 text-[#8a5a2a]"
            role="alert"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Este paciente no tiene una planificación de macronutrientes activa.
            Crea una en <strong>Macronutrientes</strong> antes de guardar la
            pauta.
          </div>
        )}
        {aviso && (
          <div
            className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${aviso.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}
          >
            <Check className="w-4 h-4" />
            {aviso.message}
          </div>
        )}

        {!hayPacienteActivo && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <strong className="font-bold flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4" /> No hay paciente activo
            </strong>
            Selecciona un paciente en "Pacientes" para poder guardar esta pauta.
          </div>
        )}

      </div>

      <div className="bg-white px-3 sm:px-6 py-3 border-x border-b border-mist rounded-b-card mb-4 shrink-0 shadow-sm overflow-x-auto scrollbar-hide">
        <div className="text-ink-soft h-9 w-fit min-w-full lg:min-w-0 lg:mx-auto items-center justify-center rounded-xl p-0.75 flex bg-mist/60">
          <button
            onClick={() => setActiveTab("tabla")}
            className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all whitespace-nowrap ${activeTab === "tabla" ? "bg-white text-ink shadow-sm" : "hover:text-ink"}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Tabla
          </button>
          <button
            onClick={() => setActiveTab("pauta")}
            className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all whitespace-nowrap ${activeTab === "pauta" ? "bg-white text-ink shadow-sm" : "hover:text-ink"}`}
          >
            <FileText className="w-3.5 h-3.5" /> Vista Pauta
          </button>
          <button
            onClick={() => setActiveTab("opciones")}
            className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all whitespace-nowrap ${activeTab === "opciones" ? "bg-white text-ink shadow-sm" : "hover:text-ink"}`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Opciones por Grupo
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all whitespace-nowrap ${activeTab === "pdf" ? "bg-white text-ink shadow-sm" : "hover:text-ink"}`}
          >
            <Download className="w-3.5 h-3.5" /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white rounded-card border border-mist p-4 shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
};
