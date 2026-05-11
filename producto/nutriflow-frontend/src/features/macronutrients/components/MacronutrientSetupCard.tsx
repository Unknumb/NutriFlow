import { useState } from 'react';
import type { ClinicalContext, MacronutrientTotals, MacroInputs, SliderProps, MacroMetrics } from '../types';

// 1. DICCIONARIO DE TEMAS ACTUALIZADO PARA SLIDERS NATIVOS
const MACRO_THEMES = {
    red: {
        borderLeft: 'border-l-red-500',
        bgIcon: 'bg-red-500',
        badgeBg: 'bg-red-100/70',
        badgeBorder: 'border-red-100',
        badgeText: 'text-red-800',
        // Clases nativas inyectadas directamente al Thumb
        thumbClasses: '[&::-webkit-slider-thumb]:bg-red-500 [&::-moz-range-thumb]:bg-red-500 focus:ring-red-500',
    },
    blue: {
        borderLeft: 'border-l-blue-500',
        bgIcon: 'bg-blue-500',
        badgeBg: 'bg-blue-100/70',
        badgeBorder: 'border-blue-100',
        badgeText: 'text-blue-800',
        thumbClasses: '[&::-webkit-slider-thumb]:bg-blue-500 [&::-moz-range-thumb]:bg-blue-500 focus:ring-blue-500',
    },
    amber: {
        borderLeft: 'border-l-amber-500',
        bgIcon: 'bg-amber-500',
        badgeBg: 'bg-amber-100/70',
        badgeBorder: 'border-amber-100',
        badgeText: 'text-amber-800',
        thumbClasses: '[&::-webkit-slider-thumb]:bg-amber-500 [&::-moz-range-thumb]:bg-amber-500 focus:ring-amber-500',
    }
};

interface MacroSliderCardProps {
    title: string;
    themeKey: 'red' | 'blue' | 'amber';
    totals: MacroMetrics;
    pesoActivo: number;
    sliderProps: SliderProps;
}

// 2. SUB-COMPONENTE CON SLIDER NATIVO (Adiós al bug del mouse)
const MacroSliderCard = ({ title, themeKey, totals, pesoActivo, sliderProps }: MacroSliderCardProps) => {
    const theme = MACRO_THEMES[themeKey];

    return (
        <div className={`bg-white flex flex-col gap-6 rounded-xl border border-gray-200 border-l-4 ${theme.borderLeft} shadow-sm`}>
            {/* Header de la Tarjeta */}
            <div className="px-6 pt-6 border-b border-gray-50 pb-4">
                <h4 className="leading-none flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${theme.bgIcon}`}></div>
                        <span className="font-bold text-gray-900">{title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-700 font-semibold text-sm px-3 py-1">{totals.pct}%</span>
                        <span className={`inline-flex items-center justify-center rounded-md ${theme.badgeBg} border ${theme.badgeBorder} ${theme.badgeText} font-semibold text-sm px-3 py-1`}>{totals.g}g</span>
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
                            // La barra negra que crece matemáticamente
                            background: `linear-gradient(to right, #111827 ${totals.pct}%, #f3f4f6 ${totals.pct}%)`
                        }}
                    />
                </div>

                {/* Cuadrícula de Métricas */}
                <div className="grid grid-cols-4 gap-3 text-sm">
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-center"><p className="text-xs text-gray-500 mb-1">Calorías</p><p className="font-bold text-gray-900">{totals.kcal} kcal</p></div>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-center"><p className="text-xs text-gray-500 mb-1">Porcentaje</p><p className="font-bold text-gray-900">{totals.pct}%</p></div>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-center"><p className="text-xs text-gray-500 mb-1">Gramos</p><p className="font-bold text-gray-900">{totals.g}g</p></div>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-center"><p className="text-xs text-gray-500 mb-1">g/kg</p><p className="font-bold text-gray-900">{(totals.g / pesoActivo).toFixed(1)}</p></div>
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

            <div className="bg-gray-100/80 p-1 h-9 items-center justify-center rounded-xl flex shadow-sm border border-gray-200/50" role="tablist">
                <button onClick={() => setActiveTab('percentage')} className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1.5 text-sm font-medium whitespace-nowrap transition-all w-full h-full ${activeTab === 'percentage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Porcentaje (%)</button>
                <button onClick={() => setActiveTab('grams')} className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1.5 text-sm font-medium whitespace-nowrap transition-all w-full h-full ${activeTab === 'grams' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Gramos Totales (g)</button>
                <button onClick={() => setActiveTab('gkg')} className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1.5 text-sm font-medium whitespace-nowrap transition-all w-full h-full ${activeTab === 'gkg' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>g/kg</button>
            </div>

            <MacroSliderCard title="Proteínas" themeKey="red" totals={totals.prot} pesoActivo={context.pesoActivo} sliderProps={protProps} />
            <MacroSliderCard title="Carbohidratos" themeKey="blue" totals={totals.cho} pesoActivo={context.pesoActivo} sliderProps={choProps} />
            <MacroSliderCard title="Grasas" themeKey="amber" totals={totals.fat} pesoActivo={context.pesoActivo} sliderProps={fatProps} />

            {totals.summary.percent !== 100 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 shadow-sm border-l-4 border-l-orange-400">
                    <span className="text-orange-500 mt-0.5">⚠️</span>
                    <div>
                        <p className="text-sm font-semibold text-orange-900">Validación de Macronutrientes</p>
                        <p className="text-sm text-orange-700 mt-1">La distribución actual suma <strong>{totals.summary.percent}%</strong>. Ajusta los deslizadores hasta alcanzar exactamente el 100%.</p>
                    </div>
                </div>
            )}
        </div>
    );
};