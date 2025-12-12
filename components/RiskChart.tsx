import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ClinicalCondition } from '../types';

interface RiskChartProps {
  conditions: ClinicalCondition[];
}

const RiskChart: React.FC<RiskChartProps> = ({ conditions }) => {
  const data = conditions.map(c => ({
    name: c.name,
    probability: c.probability,
    reasoning: c.reasoning
  }));

  // Sort by probability descending
  data.sort((a, b) => b.probability - a.probability);

  const getBarColor = (prob: number) => {
    if (prob > 75) return '#ef4444'; // red-500
    if (prob > 40) return '#f97316'; // orange-500
    return '#3b82f6'; // blue-500
  };

  return (
    <div className="w-full h-64 bg-white rounded-lg p-2">
      <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Differential Probability</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={120} 
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="probability" barSize={20} radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.probability)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskChart;
