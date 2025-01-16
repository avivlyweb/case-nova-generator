import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AgeDistributionChartProps {
  ageData: Array<{ name: string; value: number }>;
}

export const AgeDistributionChart = ({ ageData }: AgeDistributionChartProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <ChartBar className="h-5 w-5 text-primary" />
            Age Distribution
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
              <XAxis 
                dataKey="name"
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '0.5rem'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#0A2540"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};