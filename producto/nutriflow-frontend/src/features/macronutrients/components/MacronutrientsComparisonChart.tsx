import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame } from 'lucide-react';

export const MacronutrientsComparisonChart = ({ barData }: { barData: any[] }) => {
    return (
        <div className="bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 pt-6 border-b border-gray-100 pb-4">
                <h4 className="leading-none flex items-center gap-2 font-semibold">
                    <Flame className="w-5 h-5 text-gray-700" />
                    Comparativa de Macronutrientes
                </h4>
            </div>
            <div className="px-6 pb-6">
                <div className="w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#666' }}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#666' }}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#f3f4f6' }}
                                formatter={(value: any) => [`${value} kcal`, 'Calorías']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            />
                            <Bar dataKey="kcal" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};