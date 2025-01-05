import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MedicalEntity {
  name: string;
  count: number;
}

interface MedicalEntitiesChartProps {
  medicalEntities: Record<string, any>[] | null;
}

const MedicalEntitiesChart = ({ medicalEntities }: MedicalEntitiesChartProps) => {
  if (!medicalEntities?.length) return null;

  // Process medical entities data
  const entityCounts: Record<string, number> = {};
  
  medicalEntities.forEach(entitySet => {
    // Count occurrences of each entity type
    Object.entries(entitySet).forEach(([category, entities]) => {
      if (Array.isArray(entities)) {
        entities.forEach(entity => {
          const key = `${category}: ${entity}`;
          entityCounts[key] = (entityCounts[key] || 0) + 1;
        });
      }
    });
  });

  // Convert to array and sort by count
  const chartData: MedicalEntity[] = Object.entries(entityCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Show top 10 entities

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Top Medical Entities
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={90}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#0A2540" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalEntitiesChart;