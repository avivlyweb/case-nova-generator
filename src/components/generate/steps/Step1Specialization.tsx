import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Brain, Heart, Baby, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step1SpecializationProps {
  specialization: string;
  onSpecializationChange: (specialization: string) => void;
}

const specializations = [
  {
    id: "Orthopedic",
    name: "Orthopedic",
    description: "Musculoskeletal conditions, joint mobility, and rehabilitation",
    icon: <Stethoscope className="w-6 h-6" />,
    color: "orthopedic",
    commonConditions: ["Lower back pain", "Knee injuries", "Shoulder impingement", "Fracture rehabilitation"]
  },
  {
    id: "Neurological",
    name: "Neurological",
    description: "Brain, spinal cord, and nervous system disorders",
    icon: <Brain className="w-6 h-6" />,
    color: "neurological",
    commonConditions: ["Stroke recovery", "Parkinson's disease", "Spinal cord injury", "Multiple sclerosis"]
  },
  {
    id: "Cardiovascular",
    name: "Cardiovascular",
    description: "Heart and circulatory system rehabilitation",
    icon: <Heart className="w-6 h-6" />,
    color: "cardiovascular",
    commonConditions: ["Post-cardiac surgery", "Heart failure", "Pulmonary rehabilitation", "Hypertension"]
  },
  {
    id: "Pediatric",
    name: "Pediatric",
    description: "Child development and pediatric conditions",
    icon: <Baby className="w-6 h-6" />,
    color: "pediatric",
    commonConditions: ["Cerebral palsy", "Developmental delays", "Torticollis", "Sports injuries"]
  },
  {
    id: "Geriatric",
    name: "Geriatric",
    description: "Age-related conditions and mobility issues",
    icon: <Users className="w-6 h-6" />,
    color: "geriatric",
    commonConditions: ["Fall prevention", "Osteoporosis", "Balance disorders", "Arthritis management"]
  },
  {
    id: "ICU",
    name: "ICU",
    description: "Critical care and intensive care unit rehabilitation",
    icon: <Building2 className="w-6 h-6" />,
    color: "icu",
    commonConditions: ["Ventilator weaning", "ICU-acquired weakness", "Post-surgical mobility", "Delirium management"]
  }
];

export const Step1Specialization = ({ specialization, onSpecializationChange }: Step1SpecializationProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-medical-heading mb-2">Choose Your Specialization</h2>
        <p className="text-medical-body max-w-2xl mx-auto">
          Select the physiotherapy specialization that best matches your learning objectives or clinical focus area.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specializations.map((spec) => (
          <Card
            key={spec.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
              specialization === spec.id
                ? `ring-2 ring-${spec.color} bg-${spec.color}/5 border-${spec.color}`
                : "hover:border-primary/30"
            )}
            onClick={() => onSpecializationChange(spec.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-2 rounded-lg",
                  specialization === spec.id
                    ? `bg-${spec.color} text-white`
                    : `bg-${spec.color}/10 text-${spec.color}`
                )}>
                  {spec.icon}
                </div>
                {specialization === spec.id && (
                  <Badge className={`bg-${spec.color} text-white`}>Selected</Badge>
                )}
              </div>
              <CardTitle className={cn(
                "text-lg",
                specialization === spec.id ? `text-${spec.color}` : "text-foreground"
              )}>
                {spec.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {spec.description}
              </p>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Common Conditions:</div>
                <div className="flex flex-wrap gap-1">
                  {spec.commonConditions.slice(0, 2).map((condition) => (
                    <Badge key={condition} variant="secondary" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                  {spec.commonConditions.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{spec.commonConditions.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Step1Specialization;