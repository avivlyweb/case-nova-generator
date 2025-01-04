import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { List } from "lucide-react";

interface ICFCodesProps {
  codes: string;
}

const ICFCodes = ({ codes }: ICFCodesProps) => {
  if (!codes) return null;

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <List className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100">ICF Codes</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {codes.split('\n').map((code, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-sm hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
            >
              {code.trim()}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ICFCodes;