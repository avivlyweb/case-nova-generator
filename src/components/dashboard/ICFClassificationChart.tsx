import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { Json } from "@/integrations/supabase/types";

interface ICFClassificationChartProps {
  caseStudies: Array<{
    icf_codes: Json | null;
  }>;
}

export const ICFClassificationChart = ({ caseStudies }: ICFClassificationChartProps) => {
  // Process ICF codes data
  const icfCodesDistribution = caseStudies.reduce((acc: Record<string, number>, study) => {
    if (study.icf_codes) {
      const codes = Array.isArray(study.icf_codes) ? study.icf_codes : 
                   typeof study.icf_codes === 'string' ? [study.icf_codes] : [];
      
      codes.forEach((code) => {
        if (typeof code === 'string' && code.length > 0) {
          // Extract the main category (first letter) from the ICF code
          const category = code.charAt(0).toLowerCase();
          if (['b', 'd', 'e', 's'].includes(category)) {
            acc[category] = (acc[category] || 0) + 1;
          }
        }
      });
    }
    return acc;
  }, {});

  const chartData = Object.entries(icfCodesDistribution).map(([category, count]) => ({
    name: getCategoryName(category),
    value: count,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            ICF Classification Distribution
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No ICF codes found in case studies
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get category names
function getCategoryName(category: string): string {
  const categories: Record<string, string> = {
    'b': 'Body Functions',
    'd': 'Activities & Participation',
    'e': 'Environmental Factors',
    's': 'Body Structures',
  };
  return categories[category.toLowerCase()] || `Category ${category}`;
}