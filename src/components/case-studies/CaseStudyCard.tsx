import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CaseStudy } from "@/types/case-study";
import { useState } from "react";

interface CaseStudyCardProps {
  study: CaseStudy;
  analyzing: boolean;
  onAnalyze: () => void;
  onGenerate: () => void;
}

const CaseStudyCard = ({ study }: CaseStudyCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">
              Patient: {study.patient_name}
            </CardTitle>
            <CardDescription>
              {study.gender}, {study.age} years old | {study.condition}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {study.presenting_complaint && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Presenting Complaint</h3>
                <p className="mt-1">{study.presenting_complaint}</p>
              </div>
            )}
            {study.medical_history && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Medical History</h3>
                <p className="mt-1">{study.medical_history}</p>
              </div>
            )}
            {study.condition && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Primary Condition</h3>
                <p className="mt-1">{study.condition}</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CaseStudyCard;