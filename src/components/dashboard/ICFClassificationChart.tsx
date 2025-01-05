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
  console.log('Received case studies:', caseStudies); // Debug log for incoming data

  // Process ICF codes data
  const icfCodesDistribution = caseStudies.reduce((acc: Record<string, number>, study) => {
    console.log('Processing study ICF codes:', study.icf_codes); // Debug log for each study's ICF codes

    if (study.icf_codes) {
      // Handle different possible formats of icf_codes
      let codes: string[] = [];
      
      if (Array.isArray(study.icf_codes)) {
        codes = study.icf_codes.map(code => String(code));
      } else if (typeof study.icf_codes === 'string') {
        codes = [study.icf_codes];
      } else if (typeof study.icf_codes === 'object' && study.icf_codes !== null) {
        // Handle case where icf_codes might be a JSON object
        codes = Object.values(study.icf_codes).map(code => String(code));
      }

      console.log('Extracted codes:', codes); // Debug log for extracted codes

      // Process each code
      codes.forEach((code) => {
        if (typeof code === 'string' && code.trim().length > 0) {
          // Extract the main category (first letter) from the ICF code
          const category = code.trim().charAt(0).toLowerCase();
          console.log('Processing code:', code, 'Category:', category); // Debug log for each code processing
          if (['b', 'd', 'e', 's'].includes(category)) {
            acc[category] = (acc[category] || 0) + 1;
          }
        }
      });
    }
    return acc;
  }, {});

  console.log('ICF Codes Distribution:', icfCodesDistribution);

  const chartData = Object.entries(icfCodesDistribution).map(([category, count]) => ({
    name: getCategoryName(category),
    value: count,
  }));

  console.log('Chart Data:', chartData);

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
                  label={({ name, value }) => `${name}: ${value}`}
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