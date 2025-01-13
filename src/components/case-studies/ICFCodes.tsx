import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { List } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ICFCodesProps {
  codes: string | string[];
}

const ICF_CATEGORIES = {
  b: {
    name: 'Body Functions',
    color: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
  },
  d: {
    name: 'Activities & Participation',
    color: 'bg-green-100 hover:bg-green-200 text-green-800'
  },
  e: {
    name: 'Environmental Factors',
    color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
  },
  s: {
    name: 'Body Structures',
    color: 'bg-purple-100 hover:bg-purple-200 text-purple-800'
  }
};

const ICFCodes = ({ codes }: ICFCodesProps) => {
  if (!codes) return null;

  // Convert codes to array whether it comes as string or array
  const codesArray = Array.isArray(codes) 
    ? codes 
    : codes.split('\n');

  // Group codes by category
  const groupedCodes = codesArray.reduce((acc: Record<string, string[]>, code) => {
    const category = code.trim().charAt(0).toLowerCase();
    if (ICF_CATEGORIES[category as keyof typeof ICF_CATEGORIES]) {
      acc[category] = [...(acc[category] || []), code.trim()];
    }
    return acc;
  }, {});

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <List className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100">ICF Codes</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(groupedCodes).map(([category, codes]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {ICF_CATEGORIES[category as keyof typeof ICF_CATEGORIES]?.name}
              </h4>
              <div className="flex flex-wrap gap-2">
                {codes.map((code, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="secondary" 
                          className={`text-sm ${ICF_CATEGORIES[category as keyof typeof ICF_CATEGORIES]?.color} transition-colors cursor-help`}
                        >
                          {code}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{ICF_CATEGORIES[category as keyof typeof ICF_CATEGORIES]?.name} code</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ICFCodes;