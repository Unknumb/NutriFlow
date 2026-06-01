import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export const CaloricDistributionChart = ({ pieData }: { pieData: any[] }) => {
    const renderCustomLabel = ({ name, value }: any) => `${name}: ${value}%`;

    return (
        <div className="bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 pt-6 border-b border-gray-100 pb-4">
                <h4 className="leading-none flex items-center gap-2 font-semibold">
                    <Activity className="w-5 h-5 text-gray-700" />
                    Distribución Calórica
                </h4>
            </div>
            <div className="px-6 pb-6">
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={renderCustomLabel}
                                labelLine={false}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="#fff" />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => [`${value}%`, 'Porcentaje']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};