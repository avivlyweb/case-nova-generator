import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, User, FileText, Activity, Brain, Heart, Baby, Users, Building2, Stethoscope } from "lucide-react";
import { PatientFormData } from "./Step2PatientInfo";

interface Step3ReviewProps {
  specialization: string;
  formData: PatientFormData;
}

const getSpecializationIcon = (specialization: string) => {
  const icons = {
    Orthopedic: <Stethoscope className="w-5 h-5" />,
    Neurological: <Brain className="w-5 h-5" />,
    Cardiovascular: <Heart className="w-5 h-5" />,
    Pediatric: <Baby className="w-5 h-5" />,
    Geriatric: <Users className="w-5 h-5" />,
    ICU: <Building2 className="w-5 h-5" />
  };
  return icons[specialization as keyof typeof icons] || <Activity className="w-5 h-5" />;
};

const getSpecializationColor = (specialization: string) => {
  const colors = {
    Orthopedic: "orthopedic",
    Neurological: "neurological", 
    Cardiovascular: "cardiovascular",
    Pediatric: "pediatric",
    Geriatric: "geriatric",
    ICU: "icu"
  };
  return colors[specialization as keyof typeof colors] || "primary";
};

export const Step3Review = ({ specialization, formData }: Step3ReviewProps) => {
  const specializationColor = getSpecializationColor(specialization);
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-medical-heading mb-2">Review & Confirm</h2>
        <p className="text-medical-body max-w-2xl mx-auto">
          Please review all the information below before generating your case study. You can go back to make changes if needed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Specialization Summary */}
        <Card className="card-medical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getSpecializationIcon(specialization)}
              <span>Specialization</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`bg-${specializationColor} text-white text-sm px-3 py-1`}>
              {specialization} Physiotherapy
            </Badge>
          </CardContent>
        </Card>

        {/* Patient Demographics */}
        <Card className="card-medical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Patient Demographics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{formData.patientName || "Not specified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age:</span>
              <span className="font-medium">{formData.age || "Not specified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gender:</span>
              <span className="font-medium">{formData.gender || "Not specified"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Information */}
      <Card className="card-medical">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Clinical Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.condition && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Primary Condition</h4>
              <p className="text-sm">{formData.condition}</p>
            </div>
          )}
          
          {formData.symptoms && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Presenting Symptoms</h4>
                <p className="text-sm">{formData.symptoms}</p>
              </div>
            </>
          )}

          {formData.history && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Medical History</h4>
                <p className="text-sm">{formData.history}</p>
              </div>
            </>
          )}

          {formData.background && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Patient Background</h4>
                <p className="text-sm">{formData.background}</p>
              </div>
            </>
          )}

          {formData.adlProblem && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">ADL Problems</h4>
                <p className="text-sm">{formData.adlProblem}</p>
              </div>
            </>
          )}

          {formData.comorbidities && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Comorbidities</h4>
                <p className="text-sm">{formData.comorbidities}</p>
              </div>
            </>
          )}

          {formData.psychosocialFactors && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Psychosocial Factors</h4>
                <p className="text-sm">{formData.psychosocialFactors}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Generation Preview */}
      <Card className="card-medical bg-soft-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>What Will Be Generated</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Comprehensive assessment</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Evidence-based treatment plan</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Outcome measures</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Progress tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Clinical reasoning</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Learning objectives</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step3Review;