import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

const DEBOUNCE_MS = 1000;

const PatientInformation = ({ formData, onChange }: PatientInformationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const getSuggestion = async (field: string) => {
    try {
      setLoading(field);
      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: { 
          currentField: field,
          formData
        }
      });

      if (error) throw error;
      
      if (data?.suggestion) {
        onChange(field, data.suggestion);
        toast({
          title: "Suggestion generated",
          description: "The field has been auto-completed based on previous entries.",
        });
      }
    } catch (error) {
      console.error('Error getting suggestion:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate suggestion. Please try again.",
      });
    } finally {
      setLoading(null);
    }
  };

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
          <div className="flex gap-2">
            <Input
              id="condition"
              name="condition"
              placeholder="Enter primary condition"
              value={formData.condition}
              onChange={(e) => onChange("condition", e.target.value)}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => getSuggestion('condition')}
              disabled={loading === 'condition'}
            >
              <Wand2 className={loading === 'condition' ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adlProblem">ADL-related Problem</Label>
        <div className="flex gap-2">
          <Input
            id="adlProblem"
            name="adlProblem"
            placeholder="Enter ADL-related problem"
            value={formData.adlProblem}
            onChange={(e) => onChange("adlProblem", e.target.value)}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => getSuggestion('adlProblem')}
            disabled={loading === 'adlProblem' || !formData.condition}
          >
            <Wand2 className={loading === 'adlProblem' ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="background">Patient Background</Label>
        <div className="flex gap-2">
          <Textarea
            id="background"
            name="background"
            placeholder="Enter patient background"
            className="min-h-[100px]"
            value={formData.background}
            onChange={(e) => onChange("background", e.target.value)}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => getSuggestion('background')}
            disabled={loading === 'background' || !formData.adlProblem}
          >
            <Wand2 className={loading === 'background' ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="history">Medical History</Label>
        <div className="flex gap-2">
          <Textarea
            id="history"
            name="history"
            placeholder="Enter relevant medical history"
            className="min-h-[100px]"
            value={formData.history}
            onChange={(e) => onChange("history", e.target.value)}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => getSuggestion('history')}
            disabled={loading === 'history' || !formData.background}
          >
            <Wand2 className={loading === 'history' ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptoms">Current Symptoms</Label>
        <div className="flex gap-2">
          <Textarea
            id="symptoms"
            name="symptoms"
            placeholder="Describe current symptoms"
            className="min-h-[100px]"
            value={formData.symptoms}
            onChange={(e) => onChange("symptoms", e.target.value)}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => getSuggestion('symptoms')}
            disabled={loading === 'symptoms' || !formData.history}
          >
            <Wand2 className={loading === 'symptoms' ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comorbidities">Comorbidities</Label>
        <div className="flex gap-2">
          <Textarea
            id="comorbidities"
            name="comorbidities"
            placeholder="Enter comorbidities"
            className="min-h-[100px]"
            value={formData.comorbidities}
            onChange={(e) => onChange("comorbidities", e.target.value)}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => getSuggestion('comorbidities')}
            disabled={loading === 'comorbidities' || !formData.symptoms}
          >
            <Wand2 className={loading === 'comorbidities' ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="psychosocialFactors">Psychosocial Factors</Label>
        <div className="flex gap-2">
          <Textarea
            id="psychosocialFactors"
            name="psychosocialFactors"
            placeholder="Enter psychosocial factors"
            className="min-h-[100px]"
            value={formData.psychosocialFactors}
            onChange={(e) => onChange("psychosocialFactors", e.target.value)}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => getSuggestion('psychosocialFactors')}
            disabled={loading === 'psychosocialFactors' || !formData.comorbidities}
          >
            <Wand2 className={loading === 'psychosocialFactors' ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientInformation;