import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { List } from "lucide-react";

interface ICFCodesProps {
  codes: string;
}

const ICFCodes = ({ codes }: ICFCodesProps) => {
  return (
    <Card className="bg-card border-none shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <List className="h-5 w-5" />
          <h3 className="text-xl font-semibold text-primary">ICF Codes</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {codes.split('\n').map((code, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100 px-3 py-1 text-sm font-medium rounded-full"
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