import { Card, CardContent } from "@/components/ui/card";
import { Dna } from "lucide-react";

interface MedicalEntitiesProps {
  entities: any;
}

const MedicalEntities = ({ entities }: MedicalEntitiesProps) => {
  // Log the entities to help with debugging
  console.log('Medical Entities received:', entities);

  if (!entities || Object.keys(entities).length === 0) return null;

  // Process the entities to ensure we're handling both object and array formats
  const processedEntities = typeof entities === 'string' ? JSON.parse(entities) : entities;

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
          {Object.entries(processedEntities).map(([category, items]: [string, any]) => {
            if (!items || (Array.isArray(items) && items.length === 0)) return null;
            
            // Log each entity set to help with debugging
            console.log('Processing entity set:', items);
            
            return (
              <div key={category} className="space-y-2">
                <h4 className="text-lg font-medium text-primary-800 dark:text-primary-200 capitalize">
                  {category.replace(/_/g, ' ')}
                </h4>
                <ul className="list-disc pl-6 space-y-1">
                  {Array.isArray(items) ? (
                    items.map((item: string, index: number) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-700 dark:text-gray-300">{items}</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalEntities;