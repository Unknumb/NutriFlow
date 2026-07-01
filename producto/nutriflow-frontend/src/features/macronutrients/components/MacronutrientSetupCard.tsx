import { useState } from "react";
import { AlertTriangle, Wand2 } from "lucide-react";
import { MACRO_COLORS } from "../../../shared/ui/macroColors";
import type {
  ClinicalContext,
  MacronutrientTotals,
  MacroInputs,
  SliderProps,
  MacroMetrics,
} from "../types";

// Color del macro para el relleno del slider (track), por themeKey.
const TRACK_COLOR: Record<"prot" | "cho" | "fat", string> = {
  prot: MACRO_COLORS.proteinas,
  cho: MACRO_COLORS.carbohidratos,
  fat: MACRO_COLORS.grasas,
};

// 1. Temas por macro: usan el lenguaje de color del sistema (ver shared/ui/macroColors.ts)
const MACRO_THEMES = {
  prot: {
    borderLeft: "border-l-macro-prot",
    bgIcon: "bg-macro-prot",
    badgeBg: "bg-macro-prot/10",
    badgeBorder: "border-macro-prot/30",
    badgeText: "text-macro-prot",
    thumbClasses:
      "[&::-webkit-slider-thumb]:bg-macro-prot [&::-moz-range-thumb]:bg-macro-prot focus:ring-macro-prot",
  },
  cho: {
    borderLeft: "border-l-macro-cho",
    bgIcon: "bg-macro-cho",
    badgeBg: "bg-macro-cho/10",
    badgeBorder: "border-macro-cho/30",
    badgeText: "text-macro-cho",
    thumbClasses:
      "[&::-webkit-slider-thumb]:bg-macro-cho [&::-moz-range-thumb]:bg-macro-cho focus:ring-macro-cho",
  },
  fat: {
    borderLeft: "border-l-macro-gra",
    bgIcon: "bg-macro-gra",
    badgeBg: "bg-macro-gra/10",
    badgeBorder: "border-macro-gra/30",
    badgeText: "text-macro-gra",
    thumbClasses:
      "[&::-webkit-slider-thumb]:bg-macro-gra [&::-moz-range-thumb]:bg-macro-gra focus:ring-macro-gra",
  },
};

interface MacroSliderCardProps {
  title: string;
  themeKey: "prot" | "cho" | "fat";
  totals: MacroMetrics;
  pesoActivo: number;
  sliderProps: SliderProps;
}

// 2. SUB-COMPONENTE CON SLIDER NATIVO
const MacroSliderCard = ({
  title,
  themeKey,
  totals,
  pesoActivo,
  sliderProps,
}: MacroSliderCardProps) => {
  const theme = MACRO_THEMES[themeKey];

  return (
    <div
      className={`bg-white flex flex-col gap-6 rounded-card border border-mist border-l-4 shadow-card ${theme.borderLeft}`}
    >
      {/* Header de la Tarjeta */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 border-b border-mist pb-4">
        <h4 className="leading-none flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-3 h-3 rounded-full shrink-0 ${theme.bgIcon}`}></div>
            <span className="font-display font-semibold text-ink truncate">{title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center justify-center rounded-md border border-mist text-ink-soft font-semibold text-sm px-3 py-1 tnum">
              {totals.pct}%
            </span>
            <span
              className={`inline-flex items-center justify-center rounded-md ${theme.badgeBg} border ${theme.badgeBorder} ${theme.badgeText} font-semibold text-sm px-3 py-1 tnum`}
            >
              {totals.g}g
            </span>
          </div>
        </h4>
      </div>

      {/* Cuerpo y Slider Nativo */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-5">
        <div className="relative flex items-center h-5">
          <input
            type="range"
            min="0"
            max={sliderProps.max}
            step={sliderProps.step}
            value={sliderProps.val}
            aria-label={`Ajustar ${title}`}
            onChange={(e) => sliderProps.onChange(Number(e.target.value))}
            className={`w-full h-4 rounded-full appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none ${theme.thumbClasses}`}
            style={{
              background: `linear-gradient(to right, ${TRACK_COLOR[themeKey]} ${(sliderProps.val / sliderProps.max) * 100}%, #E8EAE3 ${(sliderProps.val / sliderProps.max) * 100}%)`,
            }}
          />
        </div>

        {/* Cuadrícula de Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="p-3 bg-porcelain border border-mist rounded-md text-center">
            <p className="text-xs text-ink-soft mb-1">Calorías</p>
            <p className="font-semibold text-ink tnum">{totals.kcal} kcal</p>
          </div>
          <div className="p-3 bg-porcelain border border-mist rounded-md text-center">
            <p className="text-xs text-ink-soft mb-1">Porcentaje</p>
            <p className="font-semibold text-ink tnum">{totals.pct}%</p>
          </div>
          <div className="p-3 bg-porcelain border border-mist rounded-md text-center">
            <p className="text-xs text-ink-soft mb-1">Gramos</p>
            <p className="font-semibold text-ink tnum">{totals.g}g</p>
          </div>
          <div className="p-3 bg-porcelain border border-mist rounded-md text-center">
            <p className="text-xs text-ink-soft mb-1">g/kg</p>
            <p className="font-semibold text-ink tnum">
              {pesoActivo > 0 ? (totals.g / pesoActivo).toFixed(1) : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. COMPONENTE ORQUESTADOR
interface SetupCardProps {
  context: ClinicalContext;
  inputs: MacroInputs & { protPct: number };
  totals: MacronutrientTotals;
  isBalanced: boolean;
  actions: {
    setMacro: (key: "prot" | "cho" | "fat", val: number) => void;
    updateFromGrams: (key: "prot" | "cho" | "fat", grams: number) => void;
    updateFromGramsPerKg: (key: "prot" | "cho" | "fat", gPerKg: number) => void;
    setProtGkg: (val: number) => void;
    setChoPct: (val: number) => void;
    setFatPct: (val: number) => void;
    autoBalance: () => void;
  };
}

export const MacronutrientSetupCard = ({
  context,
  inputs,
  actions,
  totals,
  isBalanced,
}: SetupCardProps) => {
  const [activeTab, setActiveTab] = useState<"percentage" | "grams" | "gkg">(
    "percentage",
  );

  // En modo Porcentaje usamos setMacro directo (sin conversión intermedia) → garantiza el 100%
  const protProps: SliderProps =
    activeTab === "percentage"
      ? {
          val: totals.prot.pct,
          max: 100,
          step: 1,
          onChange: (v) => actions.setMacro("prot", v),
        }
      : activeTab === "grams"
        ? {
            val: totals.prot.g,
            max: 400,
            step: 1,
            onChange: (v) => actions.updateFromGrams("prot", v),
          }
        : {
            val: inputs.protGkg,
            max: 4,
            step: 0.1,
            onChange: (v) => actions.updateFromGramsPerKg("prot", v),
          };

  const choProps: SliderProps =
    activeTab === "percentage"
      ? {
          val: inputs.choPct,
          max: 100,
          step: 1,
          onChange: (v) => actions.setMacro("cho", v),
        }
      : activeTab === "grams"
        ? {
            val: totals.cho.g,
            max: 600,
            step: 1,
            onChange: (v) => actions.updateFromGrams("cho", v),
          }
        : {
            val:
              context.tmbPromedio > 0 ? totals.cho.g / context.pesoActivo : 0,
            max: 10,
            step: 0.1,
            onChange: (v) => actions.updateFromGramsPerKg("cho", v),
          };

  const fatProps: SliderProps =
    activeTab === "percentage"
      ? {
          val: inputs.fatPct,
          max: 100,
          step: 1,
          onChange: (v) => actions.setMacro("fat", v),
        }
      : activeTab === "grams"
        ? {
            val: totals.fat.g,
            max: 200,
            step: 1,
            onChange: (v) => actions.updateFromGrams("fat", v),
          }
        : {
            val:
              context.tmbPromedio > 0 ? totals.fat.g / context.pesoActivo : 0,
            max: 4,
            step: 0.1,
            onChange: (v) => actions.updateFromGramsPerKg("fat", v),
          };

  return (
    <div className="col-span-7 flex flex-col h-full gap-6">
      <div
        className="bg-mist/60 p-1 min-h-9 items-center justify-center rounded-md flex border border-mist"
        role="tablist"
      >
        <button
          onClick={() => setActiveTab("percentage")}
          className={`inline-flex items-center justify-center gap-1 rounded-md border border-transparent px-2 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 w-full h-full ${activeTab === "percentage" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}
        >
          <span className="hidden sm:inline">Porcentaje</span> (%)
        </button>
        <button
          onClick={() => setActiveTab("grams")}
          className={`inline-flex items-center justify-center gap-1 rounded-md border border-transparent px-2 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 w-full h-full ${activeTab === "grams" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}
        >
          <span className="hidden sm:inline">Gramos</span> (g)
        </button>
        <button
          onClick={() => setActiveTab("gkg")}
          className={`inline-flex items-center justify-center gap-1 rounded-md border border-transparent px-2 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 w-full h-full ${activeTab === "gkg" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}
        >
          g/kg
        </button>
      </div>

      {/* Aviso de validación: visible justo encima del slider de proteínas.
                Rojo clínico si la desviación es grande (>5pts), apricot si es menor. */}
      {!isBalanced &&
        (() => {
          const desviacion = Math.abs(totals.summary.percent - 100);
          const critico = desviacion > 5;
          const palette = critico
            ? {
                bg: "bg-clinical-red/10",
                border: "border-clinical-red/40",
                borderL: "border-l-clinical-red",
                text: "text-clinical-red",
              }
            : {
                bg: "bg-apricot/15",
                border: "border-apricot/50",
                borderL: "border-l-apricot",
                text: "text-[#8a5a2a]",
              };
          return (
            <div
              className={`p-4 ${palette.bg} border ${palette.border} rounded-card border-l-4 ${palette.borderL} flex items-center gap-3 shadow-sm`}
              role="alert"
            >
              <AlertTriangle className={`w-5 h-5 shrink-0 ${palette.text}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${palette.text}`}>
                  La distribución suma {totals.summary.percent}%, no 100%
                </p>
                <p className={`text-xs mt-0.5 ${palette.text}/90`}>
                  Ajusta los deslizadores o usa el cuadre automático para llegar
                  exactamente al 100%.
                </p>
              </div>
              <button
                onClick={actions.autoBalance}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${critico ? "bg-clinical-red text-white hover:bg-clinical-red/90" : "bg-apricot text-white hover:bg-apricot/90"}`}
              >
                <Wand2 className="w-3.5 h-3.5" /> Cuadrar
              </button>
            </div>
          );
        })()}

      <MacroSliderCard
        title="Proteínas"
        themeKey="prot"
        totals={totals.prot}
        pesoActivo={context.pesoActivo}
        sliderProps={protProps}
      />
      <MacroSliderCard
        title="Carbohidratos"
        themeKey="cho"
        totals={totals.cho}
        pesoActivo={context.pesoActivo}
        sliderProps={choProps}
      />
      <MacroSliderCard
        title="Grasas"
        themeKey="fat"
        totals={totals.fat}
        pesoActivo={context.pesoActivo}
        sliderProps={fatProps}
      />
    </div>
  );
};
