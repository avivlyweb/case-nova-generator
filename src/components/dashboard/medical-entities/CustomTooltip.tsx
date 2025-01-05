import { Badge } from "@/components/ui/badge";
import { categoryLabels } from "./constants";
import type { CategoryKey } from "./constants";

interface CustomTooltipProps {
  /** Whether the tooltip is currently active */
  active?: boolean;
  /** Payload data from the chart */
  payload?: any[];
}

/**
 * Custom tooltip component for the medical entities chart
 * Displays detailed information about the selected entity
 */
export const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const category = data.category as CategoryKey;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <p className="font-medium text-gray-900">{data.name.split(': ')[1]}</p>
      <p className="text-sm text-gray-600">
        Category: {categoryLabels[category]}
      </p>
      <p className="text-sm text-gray-600">Frequency: {data.count}</p>
      {data.details.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900">Clinical Information:</p>
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
};