import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Calendar, Users2, FileText } from "lucide-react";
import MagicWandButton from "../MagicWandButton";
import type { AutoFillData } from "@/services/autoFillService";

export interface PatientFormData {
  patientName: string;
  age: number;
  gender: string;
  condition: string;
  adlProblem: string;
  background: string;
  history: string;
  symptoms: string;
  comorbidities: string;
  psychosocialFactors: string;
}

interface Step2PatientInfoProps {
  formData: PatientFormData;
  onChange: (field: string, value: string | number) => void;
  specialization?: string;
}

export const Step2PatientInfo = ({ formData, onChange, specialization }: Step2PatientInfoProps) => {
  const handleAutoFill = (autoFillData: AutoFillData) => {
    // Apply all the auto-filled data to the form
    onChange("patientName", autoFillData.patientName);
    onChange("age", autoFillData.age);
    onChange("gender", autoFillData.gender);
    onChange("condition", autoFillData.condition);
    onChange("symptoms", autoFillData.symptoms);
    onChange("background", autoFillData.background);
    onChange("history", autoFillData.history);
    onChange("adlProblem", autoFillData.adlProblem);
    onChange("comorbidities", autoFillData.comorbidities);
    onChange("psychosocialFactors", autoFillData.psychosocialFactors);
  };
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-medical-heading mb-2">Patient Information</h2>
        <p className="text-medical-body max-w-2xl mx-auto">
          Provide basic patient demographics and background information to create a realistic case study scenario.
        </p>
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg max-w-2xl mx-auto">
          <p className="text-sm text-purple-700">
            💡 <strong>Pro Tip:</strong> Enter a primary condition and click the Magic Wand to auto-fill realistic patient data!
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Demographics */}
        <Card className="card-medical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              <span>Demographics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                placeholder="e.g., John Smith"
                value={formData.patientName}
                onChange={(e) => onChange("patientName", e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="35"
                  value={formData.age || ""}
                  onChange={(e) => onChange("age", parseInt(e.target.value) || 0)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => onChange("gender", value)}>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Information */}
        <Card className="card-medical">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Primary Condition</span>
              </div>
              <MagicWandButton
                primaryCondition={formData.condition}
                specialization={specialization}
                onAutoFill={handleAutoFill}
                size="sm"
                variant="outline"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Main Condition/Diagnosis</Label>
              <Input
                id="condition"
                placeholder="e.g., Lower back pain, Stroke recovery"
                value={formData.condition}
                onChange={(e) => onChange("condition", e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Presenting Symptoms</Label>
              <Textarea
                id="symptoms"
                placeholder="Describe the main symptoms and complaints..."
                value={formData.symptoms}
                onChange={(e) => onChange("symptoms", e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card className="card-medical">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Background & History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="history">Medical History</Label>
              <Textarea
                id="history"
                placeholder="Previous medical conditions, surgeries, treatments..."
                value={formData.history}
                onChange={(e) => onChange("history", e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">Patient Background</Label>
              <Textarea
                id="background"
                placeholder="Occupation, lifestyle, activity level..."
                value={formData.background}
                onChange={(e) => onChange("background", e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 min-h-[100px]"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adlProblem">ADL Problems</Label>
              <Textarea
                id="adlProblem"
                placeholder="Activities of daily living affected..."
                value={formData.adlProblem}
                onChange={(e) => onChange("adlProblem", e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comorbidities">Comorbidities</Label>
              <Textarea
                id="comorbidities"
                placeholder="Other health conditions..."
                value={formData.comorbidities}
                onChange={(e) => onChange("comorbidities", e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 min-h-[80px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="psychosocialFactors">Psychosocial Factors</Label>
            <Textarea
              id="psychosocialFactors"
              placeholder="Social support, mental health, motivation factors..."
              value={formData.psychosocialFactors}
              onChange={(e) => onChange("psychosocialFactors", e.target.value)}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step2PatientInfo;