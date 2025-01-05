import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import { Json } from "@/integrations/supabase/types";
import { ChartContent } from "./medical-entities/ChartContent";
import { CategoryLegend } from "./medical-entities/CategoryLegend";
import { processEntityData } from "./medical-entities/utils";
import { MedicalEntity } from "./medical-entities/types";

interface MedicalEntitiesChartProps {
  /** Array of medical entities from the case study */
  medicalEntities: Json[] | null;
}

/**
 * Main component for displaying medical entities analysis
 * Shows a chart of entity frequencies categorized by type
 */
const MedicalEntitiesChart = ({ medicalEntities }: MedicalEntitiesChartProps) => {
  // Log received data for debugging purposes
  console.log('Medical Entities received:', medicalEntities);

  // Handle empty data case
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

  // Process the raw entity data
  const { entityDetails, entityCounts } = processEntityData(medicalEntities);

  // Convert to array and sort by count, showing top 10 entities
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
    .slice(0, 10);

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
          <ChartContent chartData={chartData} />
        </div>
        <CategoryLegend />
      </CardContent>
    </Card>
  );
};

export default MedicalEntitiesChart;