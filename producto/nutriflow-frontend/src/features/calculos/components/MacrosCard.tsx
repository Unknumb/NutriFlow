import { Link } from '@tanstack/react-router';
import { Card, CardHeader, CardContent } from '../../../shared/ui/atoms/Card';
import { useMacronutrientsSetup } from '../../macronutrients/hooks/useMacronutrientsSetup';
import { MACRO_COLORS } from '../../../shared/ui/macroColors';

// Resumen de SOLO LECTURA de la distribución de macros configurada en la
// pantalla de Macronutrientes (misma fuente: peso/TMB del paciente activo +
// el split guardado). No edita nada; para ajustar se va a /macronutrientes.
export const MacrosCard = () => {
    const { totals, context } = useMacronutrientsSetup();
    const totalKcal = totals.prot.kcal + totals.cho.kcal + totals.fat.kcal;

    const filas = [
        { label: 'Proteínas', color: MACRO_COLORS.proteinas, m: totals.prot },
        { label: 'Carbohidratos', color: MACRO_COLORS.carbohidratos, m: totals.cho },
        { label: 'Grasas', color: MACRO_COLORS.grasas, m: totals.fat },
    ];

    const sinDatos = context.tmbPromedio <= 0 || context.pesoActivo <= 0;

    return (
        <Card>
            <CardHeader title="Distribución de Macronutrientes" />
            <CardContent>
                {sinDatos ? (
                    <p className="text-sm text-ink-soft py-2">
                        Selecciona las fórmulas de TMB y un peso de referencia para ver la distribución sugerida.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {filas.map(({ label, color, m }) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-ink flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                                    {label}
                                </span>
                                <span className="text-sm text-ink-soft tnum">
                                    <span className="font-semibold" style={{ color }}>{m.g} g</span>
                                    <span className="mx-1.5 text-mist">·</span>
                                    {m.pct}%
                                    <span className="mx-1.5 text-mist">·</span>
                                    {m.kcal} kcal
                                </span>
                            </div>
                        ))}

                        <div className="pt-3 mt-1 border-t border-mist flex items-center justify-between">
                            <span className="text-sm font-medium text-ink-soft">Total</span>
                            <span className="cifra-data text-base font-medium text-ink">{totalKcal} kcal</span>
                        </div>

                        <Link
                            to="/macronutrientes"
                            className="block text-center text-xs font-semibold text-pine-soft hover:underline pt-1"
                        >
                            Ajustar en Macronutrientes →
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
