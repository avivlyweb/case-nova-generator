import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPie } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ConditionsChartProps {
  conditionData: Array<{ name: string; value: number }>;
}

const COLORS = ['#0A2540', '#00B4D8', '#9b87f5', '#403E43', '#8E9196'];

export const ConditionsChart = ({ conditionData }: ConditionsChartProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <ChartPie className="h-5 w-5 text-primary" />
            Conditions Distribution
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={conditionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {conditionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '0.5rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};