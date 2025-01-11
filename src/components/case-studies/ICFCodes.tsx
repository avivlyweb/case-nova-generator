import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { List } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ICFCodesProps {
  codes: string | string[];
}

const ICFCodes = ({ codes }: ICFCodesProps) => {
  if (!codes) return null;

  // Convert codes to array whether it comes as string or array
  const codesArray = Array.isArray(codes) 
    ? codes 
    : codes.split('\n');

  const getICFCategory = (code: string) => {
    const prefix = code.charAt(0);
    switch (prefix) {
      case 'b':
        return 'Body Functions';
      case 's':
        return 'Body Structures';
      case 'd':
        return 'Activities & Participation';
      case 'e':
        return 'Environmental Factors';
      default:
        return 'Other';
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <List className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100">ICF Codes</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {codesArray.map((code, index) => {
            const category = getICFCategory(code.trim());
            return (
              <HoverCard key={index}>
                <HoverCardTrigger>
                  <Badge 
                    variant="secondary" 
                    className="text-sm cursor-help hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                  >
                    {typeof code === 'string' ? code.trim() : code}
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{category}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This code belongs to the {category} category in the International Classification of Functioning, Disability and Health (ICF).
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ICFCodes;