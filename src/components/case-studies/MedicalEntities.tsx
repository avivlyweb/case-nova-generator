import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dna } from "lucide-react";

interface MedicalEntity {
  [category: string]: string[];
}

interface MedicalEntitiesProps {
  entities: MedicalEntity | string;
}

const MedicalEntities = ({ entities }: MedicalEntitiesProps) => {
  console.log('Medical Entities received:', entities);

  if (!entities || Object.keys(entities).length === 0) return null;

  // Process the entities to ensure we're handling both object and array formats
  const processedEntities = typeof entities === 'string' ? JSON.parse(entities) : entities;

  // Filter out empty categories
  const nonEmptyCategories = Object.entries(processedEntities).filter(([_, items]) => 
    Array.isArray(items) && items.length > 0
  ) as [string, string[]][];

  if (nonEmptyCategories.length === 0) return null;

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Dna className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100">
            Medical Entities
          </h3>
        </div>
        <div className="space-y-4">
          {nonEmptyCategories.map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-lg font-medium text-primary-800 dark:text-primary-200 capitalize">
                {category.replace(/_/g, ' ')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {items.map((item: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="text-sm hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalEntities;