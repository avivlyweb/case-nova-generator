import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ListChecks } from "lucide-react";
import { useEffect, useState } from "react";
import { pipeline } from "@huggingface/transformers";

interface ConditionsChartProps {
  conditionData: Array<{ name: string; value: number }>;
}

// Clinical categories with their related terms
const CLINICAL_CATEGORIES = {
  Musculoskeletal: ['arthritis', 'joint', 'muscle', 'bone', 'sprain', 'strain', 'back pain'],
  Neurological: ['nerve', 'neural', 'brain', 'spine', 'sciatica'],
  Cardiovascular: ['heart', 'cardiac', 'vascular', 'circulation'],
  Respiratory: ['lung', 'breath', 'respiratory', 'pulmonary'],
  Other: []
};

const COLORS = {
  Musculoskeletal: '#0A2540',
  Neurological: '#00B4D8',
  Cardiovascular: '#9b87f5',
  Respiratory: '#403E43',
  Other: '#8E9196'
};

export const ConditionsChart = ({ conditionData }: ConditionsChartProps) => {
  const [categorizedData, setCategorizedData] = useState<Array<{ name: string; value: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const categorizeConditions = async () => {
      try {
        // Initialize the zero-shot classification pipeline
        const classifier = await pipeline(
          "zero-shot-classification",
          "onnx-community/clinical-bert-base-uncased",
          { device: "cpu" }
        );

        // Group conditions by category
        const categoryCount: Record<string, number> = {
          Musculoskeletal: 0,
          Neurological: 0,
          Cardiovascular: 0,
          Respiratory: 0,
          Other: 0
        };

        // Process each condition
        for (const condition of conditionData) {
          const result = await classifier(condition.name, 
            ["Musculoskeletal", "Neurological", "Cardiovascular", "Respiratory"]);
          
          // Get the highest scoring category
          const topCategory = result.labels[0];
          const score = result.scores[0];

          // If the confidence is high enough, assign to that category
          if (score > 0.3) {
            categoryCount[topCategory] += condition.value;
          } else {
            categoryCount.Other += condition.value;
          }
        }

        // Convert to chart data format and sort by value
        const newData = Object.entries(categoryCount)
          .map(([name, value]) => ({ name, value }))
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value);

        setCategorizedData(newData);
      } catch (error) {
        console.error('Error categorizing conditions:', error);
        // Fallback to original data if categorization fails
        setCategorizedData(conditionData);
      } finally {
        setIsLoading(false);
      }
    };

    if (conditionData.length > 0) {
      categorizeConditions();
    }
  }, [conditionData]);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Clinical Categories Distribution
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categorizedData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={90}
                  style={{
                    fontSize: '12px',
                    fontFamily: 'system-ui'
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '0.5rem'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} cases`,
                    'Category'
                  ]}
                />
                <Bar dataKey="value" minPointSize={2}>
                  {categorizedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};