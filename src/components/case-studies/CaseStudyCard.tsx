import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CaseStudy } from "@/types/case-study";

interface CaseStudyCardProps {
  study: CaseStudy;
}

const CaseStudyCard = ({ study }: CaseStudyCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{study.patient_name}</CardTitle>
        <CardDescription>
          {study.age} years old, {study.gender}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Condition:</strong> {study.condition}</p>
          <p><strong>Specialization:</strong> {study.specialization}</p>
          {study.presenting_complaint && (
            <p><strong>Presenting Complaint:</strong> {study.presenting_complaint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseStudyCard;