import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { CustomTooltip } from './CustomTooltip';
import { categoryColors } from './constants';
import { MedicalEntity } from './types';

interface ChartContentProps {
  chartData: MedicalEntity[];
}

export const ChartContent = ({ chartData }: ChartContentProps) => {
  if (!chartData.length) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No entities found in the data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={110}
          tick={{ fontSize: 11 }}
          tickFormatter={(value) => value.split(': ')[1]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="count" 
          fill="#0A2540"
          background={{ fill: '#eee' }}
          radius={[0, 4, 4, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={categoryColors[entry.category as keyof typeof categoryColors] || '#0A2540'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};