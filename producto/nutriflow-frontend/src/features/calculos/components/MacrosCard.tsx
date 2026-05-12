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
                            <label className="text-sm font-medium text-gray-700">Proteínas</label>
                            <select className="text-xs border-gray-300 rounded bg-white px-1">
                                <option>g/kg</option>
                                <option>%</option>
                            </select>
                        </div>
                        <Input label="" id="prot" type="number" defaultValue="1.2" />
                        <p className="text-xs text-gray-500 mt-1">1.2 g/kg × 67.4 kg = 81 g</p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">Carbohidratos</label>
                            <select className="text-xs border-gray-300 rounded bg-white px-1">
                                <option>%</option>
                                <option>g/kg</option>
                            </select>
                        </div>
                        <Input label="" id="carbs" type="number" defaultValue="50" />
                        <p className="text-xs text-gray-500 mt-1">50%</p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">Grasas</label>
                            <select className="text-xs border-gray-300 rounded bg-white px-1">
                                <option>%</option>
                                <option>g/kg</option>
                            </select>
                        </div>
                        <Input label="" id="fats" type="number" defaultValue="30" />
                        <p className="text-xs text-gray-500 mt-1">30%</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400 italic">
                            Nota: Los valores en g/kg se multiplican por el Peso Activo (67.4 kg)
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};