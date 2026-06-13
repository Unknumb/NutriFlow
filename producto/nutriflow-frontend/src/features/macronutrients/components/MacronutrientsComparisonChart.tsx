import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame } from 'lucide-react';
import { Cell } from 'recharts';
import { MACRO_COLORS } from '../../../shared/ui/macroColors';

const BAR_COLORS = [MACRO_COLORS.proteinas, MACRO_COLORS.carbohidratos, MACRO_COLORS.grasas];

export const MacronutrientsComparisonChart = ({ barData }: { barData: any[] }) => {
    return (
        <div className="bg-white text-ink flex flex-col gap-6 rounded-card border border-mist shadow-card">
            <div className="px-6 pt-6 border-b border-mist pb-4">
                <h4 className="leading-none flex items-center gap-2 font-display font-semibold text-[17px]">
                    <Flame className="w-5 h-5 text-pine-soft" />
                    Comparativa de Macronutrientes
                </h4>
            </div>
            <div className="px-6 pb-6">
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#5A6660' }}
                                axisLine={{ stroke: '#E8EAE3' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#5A6660' }}
                                axisLine={{ stroke: '#E8EAE3' }}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#E8EAE3', opacity: 0.4 }}
                                formatter={(value: any) => [`${value} kcal`, 'Calorías']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #E8EAE3', fontFamily: 'inherit' }}
                            />
                            <Bar dataKey="kcal" radius={[4, 4, 0, 0]}>
                                {barData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};