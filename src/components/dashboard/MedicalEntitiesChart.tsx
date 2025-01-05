import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Json } from "@/integrations/supabase/types";

interface MedicalEntity {
  name: string;
  count: number;
}

interface MedicalEntitiesChartProps {
  medicalEntities: Json[] | null;
}

const MedicalEntitiesChart = ({ medicalEntities }: MedicalEntitiesChartProps) => {
  console.log('Medical Entities received:', medicalEntities);

  if (!medicalEntities?.length) {
    console.log('No medical entities array or empty array');
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
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No medical entities data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process medical entities data
  const entityCounts: Record<string, number> = {};
  
  medicalEntities.forEach(entitySet => {
    console.log('Processing entity set:', entitySet);
    if (typeof entitySet === 'object' && entitySet !== null) {
      Object.entries(entitySet).forEach(([category, entities]) => {
        console.log('Category:', category, 'Entities:', entities);
        if (Array.isArray(entities)) {
          entities.forEach(entity => {
            if (typeof entity === 'string') {
              const key = `${category}: ${entity}`;
              entityCounts[key] = (entityCounts[key] || 0) + 1;
            }
          });
        }
      });
    }
  });

  console.log('Entity counts:', entityCounts);

  // Convert to array and sort by count
  const chartData: MedicalEntity[] = Object.entries(entityCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Show top 10 entities

  console.log('Chart data:', chartData);

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
          {chartData.length > 0 ? (
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
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No entities found in the data
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalEntitiesChart;