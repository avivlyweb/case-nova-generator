import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Json } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";

interface MedicalEntity {
  name: string;
  count: number;
  category: string;
  details: string[];
}

interface MedicalEntitiesChartProps {
  medicalEntities: Json[] | null;
}

const categoryColors = {
  conditions: "#0088FE",
  symptoms: "#00C49F",
  medications: "#FFBB28",
  procedures: "#FF8042",
  tests: "#8884d8",
  anatomical: "#82ca9d"
};

const MedicalEntitiesChart = ({ medicalEntities }: MedicalEntitiesChartProps) => {
  console.log('Medical Entities received:', medicalEntities);

  if (!medicalEntities?.length) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Clinical Entities Analysis
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

  // Process medical entities data with improved categorization
  const entityDetails: Record<string, string[]> = {};
  const entityCounts: Record<string, number> = {};
  
  medicalEntities.forEach(entitySet => {
    if (typeof entitySet === 'object' && entitySet !== null) {
      Object.entries(entitySet).forEach(([category, entities]) => {
        if (Array.isArray(entities)) {
          entities.forEach(entity => {
            if (typeof entity === 'string') {
              // Extract entity name and clinical note if present
              const [entityName, ...notes] = entity.split('(');
              const cleanName = entityName.trim().toLowerCase();
              const formattedEntity = `${category}: ${cleanName}`;
              
              // Store entity details
              if (!entityDetails[formattedEntity]) {
                entityDetails[formattedEntity] = [];
              }
              if (notes.length > 0) {
                const note = notes.join('(').replace(/\)$/, '').trim();
                if (!entityDetails[formattedEntity].includes(note)) {
                  entityDetails[formattedEntity].push(note);
                }
              }
              
              // Count occurrences
              entityCounts[formattedEntity] = (entityCounts[formattedEntity] || 0) + 1;
            }
          });
        }
      });
    }
  });

  // Convert to array and sort by count
  const chartData: MedicalEntity[] = Object.entries(entityCounts)
    .map(([name, count]) => {
      const [category] = name.split(':');
      return {
        name,
        count,
        category,
        details: entityDetails[name] || []
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Show top 10 entities

  console.log('Chart data:', chartData);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name.split(': ')[1]}</p>
          <p className="text-sm text-gray-600">Category: {data.category}</p>
          <p className="text-sm text-gray-600">Frequency: {data.count}</p>
          {data.details.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900">Clinical Notes:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.details.map((detail: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {detail}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Clinical Entities Analysis
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {chartData.length > 0 ? (
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
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No entities found in the data
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Categories:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm capitalize">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalEntitiesChart;