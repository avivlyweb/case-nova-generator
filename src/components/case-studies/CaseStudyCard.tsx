import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, BookOpen } from "lucide-react";
import { CaseStudy } from "@/types/case-study";

interface CaseStudyCardProps {
  study: CaseStudy;
  analyzing: boolean;
  onAnalyze: () => void;
  onGenerate: () => void;
}

const CaseStudyCard = ({ study, analyzing, onAnalyze, onGenerate }: CaseStudyCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <CardTitle className="text-xl">
              Patient: {study.patient_name}
            </CardTitle>
            <CardDescription>
              {study.gender}, {study.age} years old | {study.condition}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAnalyze}
              disabled={analyzing}
              className="w-full sm:w-auto"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Quick Analysis
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onGenerate}
              disabled={analyzing}
              className="w-full sm:w-auto"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Generate Full Case
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {study.condition && (
          <p className="text-sm text-muted-foreground">
            Primary Condition: {study.condition}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CaseStudyCard;