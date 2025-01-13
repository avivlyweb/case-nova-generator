import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dna } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface MedicalEntity {
  [category: string]: string[];
}

interface MedicalEntitiesProps {
  entities: MedicalEntity | string;
}

const ENTITY_COLORS = {
  conditions: "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50",
  symptoms: "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50",
  findings: "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50",
  treatments: "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50",
  anatomical_sites: "bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50",
  measurements: "bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/30 dark:hover:bg-pink-900/50",
  procedures: "bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50",
  risk_factors: "bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50"
};

const ENTITY_DESCRIPTIONS = {
  conditions: "Medical conditions and diagnoses",
  symptoms: "Reported symptoms and clinical manifestations",
  findings: "Clinical observations and examination results",
  treatments: "Medications and therapeutic interventions",
  anatomical_sites: "Body parts and anatomical locations",
  measurements: "Quantitative measurements and clinical scores",
  procedures: "Medical procedures and diagnostic tests",
  risk_factors: "Identified risk factors and complications"
};

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
    <TooltipProvider>
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
                    <Tooltip key={index}>
                      <TooltipTrigger>
                        <Badge 
                          variant="secondary"
                          className={`text-sm transition-colors ${ENTITY_COLORS[category as keyof typeof ENTITY_COLORS] || ''}`}
                        >
                          {item}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{ENTITY_DESCRIPTIONS[category as keyof typeof ENTITY_DESCRIPTIONS] || 'Medical entity'}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default MedicalEntities;