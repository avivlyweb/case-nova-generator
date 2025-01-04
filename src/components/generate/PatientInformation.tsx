import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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

const PatientInformation = ({ formData, onChange }: PatientInformationProps) => {
  return (
    <Card className="p-6 space-y-6 bg-black/5 dark:bg-white/5 backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Patient Information
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="patientName" className="text-lg font-semibold">Patient Name</Label>
          <Input
            id="patientName"
            name="patientName"
            placeholder="Enter patient name"
            value={formData.patientName}
            onChange={(e) => onChange("patientName", e.target.value)}
            className="bg-white/50 dark:bg-black/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age" className="text-lg font-semibold">Age</Label>
          <Input
            id="age"
            name="age"
            type="number"
            placeholder="Enter age"
            value={formData.age}
            onChange={(e) => onChange("age", parseInt(e.target.value))}
            className="bg-white/50 dark:bg-black/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="text-lg font-semibold">Gender</Label>
          <Select
            name="gender"
            value={formData.gender}
            onValueChange={(value) => onChange("gender", value)}
          >
            <SelectTrigger className="bg-white/50 dark:bg-black/50">
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
          <Label htmlFor="condition" className="text-lg font-semibold">Primary Condition</Label>
          <Input
            id="condition"
            name="condition"
            placeholder="Enter primary condition"
            value={formData.condition}
            onChange={(e) => onChange("condition", e.target.value)}
            className="bg-white/50 dark:bg-black/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adlProblem" className="text-lg font-semibold">ADL-related Problem</Label>
        <Input
          id="adlProblem"
          name="adlProblem"
          placeholder="Enter ADL-related problem"
          value={formData.adlProblem}
          onChange={(e) => onChange("adlProblem", e.target.value)}
          className="bg-white/50 dark:bg-black/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="background" className="text-lg font-semibold">Patient Background</Label>
        <Textarea
          id="background"
          name="background"
          placeholder="Enter patient background"
          className="min-h-[100px] bg-white/50 dark:bg-black/50"
          value={formData.background}
          onChange={(e) => onChange("background", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="history" className="text-lg font-semibold">Medical History</Label>
        <Textarea
          id="history"
          name="history"
          placeholder="Enter relevant medical history"
          className="min-h-[100px] bg-white/50 dark:bg-black/50"
          value={formData.history}
          onChange={(e) => onChange("history", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptoms" className="text-lg font-semibold">Current Symptoms</Label>
        <Textarea
          id="symptoms"
          name="symptoms"
          placeholder="Describe current symptoms"
          className="min-h-[100px] bg-white/50 dark:bg-black/50"
          value={formData.symptoms}
          onChange={(e) => onChange("symptoms", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comorbidities" className="text-lg font-semibold">Comorbidities</Label>
        <Textarea
          id="comorbidities"
          name="comorbidities"
          placeholder="Enter comorbidities"
          className="min-h-[100px] bg-white/50 dark:bg-black/50"
          value={formData.comorbidities}
          onChange={(e) => onChange("comorbidities", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="psychosocialFactors" className="text-lg font-semibold">Psychosocial Factors</Label>
        <Textarea
          id="psychosocialFactors"
          name="psychosocialFactors"
          placeholder="Enter psychosocial factors"
          className="min-h-[100px] bg-white/50 dark:bg-black/50"
          value={formData.psychosocialFactors}
          onChange={(e) => onChange("psychosocialFactors", e.target.value)}
        />
      </div>
    </Card>
  );
};

export default PatientInformation;