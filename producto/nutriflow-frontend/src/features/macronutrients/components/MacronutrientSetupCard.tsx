import { useState } from 'react';
import type { ClinicalContext, MacronutrientTotals, MacroInputs, SliderProps, MacroMetrics } from '../types';

// 1. Temas por macro: usan el lenguaje de color del sistema (ver shared/ui/macroColors.ts)
const MACRO_THEMES = {
    prot: {
        borderLeft: 'border-l-macro-prot',
        bgIcon: 'bg-macro-prot',
        badgeBg: 'bg-macro-prot/10',
        badgeBorder: 'border-macro-prot/30',
        badgeText: 'text-macro-prot',
        // Clases nativas inyectadas directamente al Thumb
        thumbClasses: '[&::-webkit-slider-thumb]:bg-macro-prot [&::-moz-range-thumb]:bg-macro-prot focus:ring-macro-prot',
    },
    cho: {
        borderLeft: 'border-l-macro-cho',
        bgIcon: 'bg-macro-cho',
        badgeBg: 'bg-macro-cho/10',
        badgeBorder: 'border-macro-cho/30',
        badgeText: 'text-macro-cho',
        thumbClasses: '[&::-webkit-slider-thumb]:bg-macro-cho [&::-moz-range-thumb]:bg-macro-cho focus:ring-macro-cho',
    },
    fat: {
        borderLeft: 'border-l-macro-gra',
        bgIcon: 'bg-macro-gra',
        badgeBg: 'bg-macro-gra/10',
        badgeBorder: 'border-macro-gra/30',
        badgeText: 'text-macro-gra',
        thumbClasses: '[&::-webkit-slider-thumb]:bg-macro-gra [&::-moz-range-thumb]:bg-macro-gra focus:ring-macro-gra',
    }
};

interface MacroSliderCardProps {
    title: string;
    themeKey: 'prot' | 'cho' | 'fat';
    totals: MacroMetrics;
    pesoActivo: number;
    sliderProps: SliderProps;
}

// 2. SUB-COMPONENTE CON SLIDER NATIVO (Adiós al bug del mouse)
const MacroSliderCard = ({ title, themeKey, totals, pesoActivo, sliderProps }: MacroSliderCardProps) => {
    const theme = MACRO_THEMES[themeKey];

    return (
        <div className={`bg-white flex flex-col gap-6 rounded-card border border-mist border-l-4 shadow-card ${theme.borderLeft}`}>
            {/* Header de la Tarjeta */}
            <div className="px-6 pt-6 border-b border-mist pb-4">
                <h4 className="leading-none flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${theme.bgIcon}`}></div>
                        <span className="font-display font-semibold text-ink">{title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center rounded-md border border-mist text-ink-soft font-semibold text-sm px-3 py-1 tnum">{totals.pct}%</span>
                        <span className={`inline-flex items-center justify-center rounded-md ${theme.badgeBg} border ${theme.badgeBorder} ${theme.badgeText} font-semibold text-sm px-3 py-1 tnum`}>{totals.g}g</span>
                    </div>
                </h4>
            </div>

            {/* Cuerpo y Slider Nativo */}
            <div className="px-6 pb-6 space-y-5">
                
                <div className="relative flex items-center h-5">
                    <input
                        type="range"
                        min="0"
                        max={sliderProps.max}
                        step={sliderProps.step}
                        value={sliderProps.val}
                        onChange={(e) => sliderProps.onChange(Number(e.target.value))}
                        // Estilos base y la inyección del color dinámico del Thumb
                        className={`w-full h-4 rounded-full appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none ${theme.thumbClasses}`}
                        style={{
                            // La barra negra que crece matemáticamente sincronizada con el thumb
                            background: `linear-gradient(to right, #1F3D33 ${(sliderProps.val / sliderProps.max) * 100}%, #E8EAE3 ${(sliderProps.val / sliderProps.max) * 100}%)`
                        }}
                    />
                </div>

                {/* Cuadrícula de Métricas */}
                <div className="grid grid-cols-4 gap-3 text-sm">
                    <div className="p-3 bg-porcelain border border-mist rounded-md text-center"><p className="text-xs text-ink-soft mb-1">Calorías</p><p className="font-semibold text-ink tnum">{totals.kcal} kcal</p></div>
                    <div className="p-3 bg-porcelain border border-mist rounded-md text-center"><p className="text-xs text-ink-soft mb-1">Porcentaje</p><p className="font-semibold text-ink tnum">{totals.pct}%</p></div>
                    <div className="p-3 bg-porcelain border border-mist rounded-md text-center"><p className="text-xs text-ink-soft mb-1">Gramos</p><p className="font-semibold text-ink tnum">{totals.g}g</p></div>
                    <div className="p-3 bg-porcelain border border-mist rounded-md text-center"><p className="text-xs text-ink-soft mb-1">g/kg</p><p className="font-semibold text-ink tnum">{(totals.g / pesoActivo).toFixed(1)}</p></div>
                </div>
            </div>
        </div>
    );
};

// 3. COMPONENTE ORQUESTADOR
interface SetupCardProps {
    context: ClinicalContext;
    inputs: MacroInputs;
    totals: MacronutrientTotals;
    actions: {
        setProtGkg: (val: number) => void;
        setChoPct: (val: number) => void;
        setFatPct: (val: number) => void;
    };
}

export const MacronutrientSetupCard = ({ context, inputs, actions, totals }: SetupCardProps) => {
    const [activeTab, setActiveTab] = useState<'percentage' | 'grams' | 'gkg'>('percentage');

    const protProps: SliderProps = activeTab === 'percentage'
        ? { val: totals.prot.pct, max: 100, step: 1, onChange: (v: number) => actions.setProtGkg(((v / 100) * context.tmbPromedio / 4) / context.pesoActivo) }
        : activeTab === 'grams'
            ? { val: totals.prot.g, max: 400, step: 1, onChange: (v: number) => actions.setProtGkg(v / context.pesoActivo) }
            : { val: inputs.protGkg, max: 4, step: 0.1, onChange: (v: number) => actions.setProtGkg(v) };

    const choProps: SliderProps = activeTab === 'percentage'
        ? { val: inputs.choPct, max: 100, step: 1, onChange: (v: number) => actions.setChoPct(v) }
        : activeTab === 'grams'
            ? { val: totals.cho.g, max: 600, step: 1, onChange: (v: number) => actions.setChoPct(((v * 4) / context.tmbPromedio) * 100) }
            : { val: totals.cho.g / context.pesoActivo, max: 10, step: 0.1, onChange: (v: number) => actions.setChoPct((((v * context.pesoActivo) * 4) / context.tmbPromedio) * 100) };

    const fatProps: SliderProps = activeTab === 'percentage'
        ? { val: inputs.fatPct, max: 100, step: 1, onChange: (v: number) => actions.setFatPct(v) }
        : activeTab === 'grams'
            ? { val: totals.fat.g, max: 200, step: 1, onChange: (v: number) => actions.setFatPct(((v * 9) / context.tmbPromedio) * 100) }
            : { val: totals.fat.g / context.pesoActivo, max: 4, step: 0.1, onChange: (v: number) => actions.setFatPct((((v * context.pesoActivo) * 9) / context.tmbPromedio) * 100) };

    return (
        <div className="col-span-7 flex flex-col h-full gap-6">

            <div className="bg-mist/60 p-1 h-9 items-center justify-center rounded-md flex border border-mist" role="tablist">
                <button onClick={() => setActiveTab('percentage')} className={`inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 w-full h-full ${activeTab === 'percentage' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}>Porcentaje (%)</button>
                <button onClick={() => setActiveTab('grams')} className={`inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 w-full h-full ${activeTab === 'grams' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}>Gramos Totales (g)</button>
                <button onClick={() => setActiveTab('gkg')} className={`inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 w-full h-full ${activeTab === 'gkg' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}>g/kg</button>
            </div>

            <MacroSliderCard title="Proteínas" themeKey="prot" totals={totals.prot} pesoActivo={context.pesoActivo} sliderProps={protProps} />
            <MacroSliderCard title="Carbohidratos" themeKey="cho" totals={totals.cho} pesoActivo={context.pesoActivo} sliderProps={choProps} />
            <MacroSliderCard title="Grasas" themeKey="fat" totals={totals.fat} pesoActivo={context.pesoActivo} sliderProps={fatProps} />

            {totals.summary.percent !== 100 && (
                <div className="p-4 bg-apricot/10 border border-apricot/40 rounded-card flex items-start gap-3 border-l-4 border-l-apricot">
                    <span className="text-[#8a5a2a] mt-0.5">⚠️</span>
                    <div>
                        <p className="text-sm font-semibold text-[#8a5a2a]">Validación de Macronutrientes</p>
                        <p className="text-sm text-[#8a5a2a]/90 mt-1">La distribución actual suma <strong>{totals.summary.percent}%</strong>. Ajusta los deslizadores hasta alcanzar exactamente el 100%.</p>
                    </div>
                </div>
            )}
        </div>
    );
};