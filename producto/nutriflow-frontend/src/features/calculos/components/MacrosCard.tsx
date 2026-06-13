import { Card, CardHeader, CardContent } from '../../../shared/ui/atoms/Card';
import { Input } from '../../../shared/ui/atoms/Input';

interface MacrosProps {
    data?: any;
}

export const MacrosCard = (_props: MacrosProps) => {
    return (
        <Card>
            <CardHeader title="Distribución de Macronutrientes" />
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-ink flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-macro-prot inline-block" />Proteínas</label>
                            <select className="text-xs border border-mist rounded-md bg-white px-1.5 py-0.5 text-ink-soft">
                                <option>g/kg</option>
                                <option>%</option>
                            </select>
                        </div>
                        <Input label="" id="prot" type="number" defaultValue="1.2" />
                        <p className="text-xs text-ink-soft mt-1 tnum">1.2 g/kg × 67.4 kg = 81 g</p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-ink flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-macro-cho inline-block" />Carbohidratos</label>
                            <select className="text-xs border border-mist rounded-md bg-white px-1.5 py-0.5 text-ink-soft">
                                <option>%</option>
                                <option>g/kg</option>
                            </select>
                        </div>
                        <Input label="" id="carbs" type="number" defaultValue="50" />
                        <p className="text-xs text-ink-soft mt-1 tnum">50%</p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-ink flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-macro-gra inline-block" />Grasas</label>
                            <select className="text-xs border border-mist rounded-md bg-white px-1.5 py-0.5 text-ink-soft">
                                <option>%</option>
                                <option>g/kg</option>
                            </select>
                        </div>
                        <Input label="" id="fats" type="number" defaultValue="30" />
                        <p className="text-xs text-ink-soft mt-1 tnum">30%</p>
                    </div>

                    <div className="pt-3 border-t border-mist">
                        <p className="text-xs text-ink-soft/70 italic">
                            Nota: Los valores en g/kg se multiplican por el Peso Activo (67.4 kg)
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};