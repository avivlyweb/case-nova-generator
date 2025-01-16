import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAISuggestions } from "@/lib/aiSuggestions";

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

interface PatientInformationProps {
  formData: PatientFormData;
  onChange: (field: string, value: string | number) => void;
  specialization: string;
}

const PatientInformation = ({ formData, onChange, specialization }: PatientInformationProps) => {
  const { toast } = useToast();
  const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);

  const handleSuggest = async (field: string) => {
    setLoadingSuggestion(field);
    try {
      const suggestion = await getAISuggestions(
        field,
        formData[field as keyof PatientFormData] as string,
        specialization,
        {
          condition: formData.condition,
          symptoms: formData.symptoms,
          history: formData.history,
        }
      );

      if (suggestion) {
        onChange(field, suggestion);
        toast({
          title: "AI Suggestion Applied",
          description: "The field has been updated with AI-generated content.",
        });
      }
    } catch (error) {
      console.error('Error getting suggestion:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI suggestion. Please try again.",
      });
    } finally {
      setLoadingSuggestion(null);
    }
  };

  const renderSuggestButton = (field: string) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="absolute right-2 top-2"
      onClick={() => handleSuggest(field)}
      disabled={loadingSuggestion !== null}
    >
      {loadingSuggestion === field ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            name="patientName"
            placeholder="Enter patient name"
            value={formData.patientName}
            onChange={(e) => onChange("patientName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            type="number"
            placeholder="Enter age"
            value={formData.age}
            onChange={(e) => onChange("age", parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            name="gender"
            value={formData.gender}
            onValueChange={(value) => onChange("gender", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Primary Condition</Label>
          <div className="relative">
            <Input
              id="condition"
              name="condition"
              placeholder="Enter primary condition"
              value={formData.condition}
              onChange={(e) => onChange("condition", e.target.value)}
            />
            {renderSuggestButton("condition")}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adlProblem">ADL-related Problem</Label>
        <div className="relative">
          <Input
            id="adlProblem"
            name="adlProblem"
            placeholder="Enter ADL-related problem"
            value={formData.adlProblem}
            onChange={(e) => onChange("adlProblem", e.target.value)}
          />
          {renderSuggestButton("adlProblem")}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="background">Patient Background</Label>
        <div className="relative">
          <Textarea
            id="background"
            name="background"
            placeholder="Enter patient background"
            className="min-h-[100px] pr-10"
            value={formData.background}
            onChange={(e) => onChange("background", e.target.value)}
          />
          {renderSuggestButton("background")}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="history">Medical History</Label>
        <div className="relative">
          <Textarea
            id="history"
            name="history"
            placeholder="Enter relevant medical history"
            className="min-h-[100px] pr-10"
            value={formData.history}
            onChange={(e) => onChange("history", e.target.value)}
          />
          {renderSuggestButton("history")}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptoms">Current Symptoms</Label>
        <div className="relative">
          <Textarea
            id="symptoms"
            name="symptoms"
            placeholder="Describe current symptoms"
            className="min-h-[100px] pr-10"
            value={formData.symptoms}
            onChange={(e) => onChange("symptoms", e.target.value)}
          />
          {renderSuggestButton("symptoms")}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comorbidities">Comorbidities</Label>
        <div className="relative">
          <Textarea
            id="comorbidities"
            name="comorbidities"
            placeholder="Enter comorbidities"
            className="min-h-[100px] pr-10"
            value={formData.comorbidities}
            onChange={(e) => onChange("comorbidities", e.target.value)}
          />
          {renderSuggestButton("comorbidities")}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="psychosocialFactors">Psychosocial Factors</Label>
        <div className="relative">
          <Textarea
            id="psychosocialFactors"
            name="psychosocialFactors"
            placeholder="Enter psychosocial factors"
            className="min-h-[100px] pr-10"
            value={formData.psychosocialFactors}
            onChange={(e) => onChange("psychosocialFactors", e.target.value)}
          />
          {renderSuggestButton("psychosocialFactors")}
        </div>
      </div>
    </div>
  );
};

export default PatientInformation;