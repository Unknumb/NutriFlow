// Contrato estricto para las métricas de un macronutriente individual
export interface MacroMetrics {
    g: number;
    kcal: number;
    pct: number;
}

// Contrato de los totales calculados
export interface MacronutrientTotals {
    prot: MacroMetrics;
    cho: MacroMetrics;
    fat: MacroMetrics;
    summary: {
        grams: number;
        percent: number;
    };
}

// Contrato del paciente/contexto actual
export interface ClinicalContext {
    pesoActivo: number;
    tmbPromedio: number;
}

// Contrato para los inputs manuales del usuario
export interface MacroInputs {
    protGkg: number;
    choPct: number;
    fatPct: number;
}

// (Mantén los tipos que ya tenías arriba: MacroMetrics, MacronutrientTotals, etc.)

// Contrato para las propiedades del Slider interactivo
export interface SliderProps {
    val: number;
    max: number;
    step: number;
    onChange: (val: number) => void;
}

// Contrato para los datos del gráfico de pastel
export interface PieChartData {
    name: string;
    value: number;
    fill: string;
}

// Contrato para los datos del gráfico de barras
export interface BarChartData {
    name: string;
    kcal: number;
}