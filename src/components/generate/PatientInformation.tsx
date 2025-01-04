import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientInformationProps {
  formData: FormData;
  onChange: (field: string, value: string | number) => void;
}

const PatientInformation = ({ formData, onChange }: PatientInformationProps) => {
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
          <Input
            id="condition"
            name="condition"
            placeholder="Enter primary condition"
            value={formData.condition}
            onChange={(e) => onChange("condition", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adlProblem">ADL-related Problem</Label>
        <Input
          id="adlProblem"
          name="adlProblem"
          placeholder="Enter ADL-related problem"
          value={formData.adlProblem}
          onChange={(e) => onChange("adlProblem", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="background">Patient Background</Label>
        <Textarea
          id="background"
          name="background"
          placeholder="Enter patient background"
          className="min-h-[100px]"
          value={formData.background}
          onChange={(e) => onChange("background", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="history">Medical History</Label>
        <Textarea
          id="history"
          name="history"
          placeholder="Enter relevant medical history"
          className="min-h-[100px]"
          value={formData.history}
          onChange={(e) => onChange("history", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptoms">Current Symptoms</Label>
        <Textarea
          id="symptoms"
          name="symptoms"
          placeholder="Describe current symptoms"
          className="min-h-[100px]"
          value={formData.symptoms}
          onChange={(e) => onChange("symptoms", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comorbidities">Comorbidities</Label>
        <Textarea
          id="comorbidities"
          name="comorbidities"
          placeholder="Enter comorbidities"
          className="min-h-[100px]"
          value={formData.comorbidities}
          onChange={(e) => onChange("comorbidities", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="psychosocialFactors">Psychosocial Factors</Label>
        <Textarea
          id="psychosocialFactors"
          name="psychosocialFactors"
          placeholder="Enter psychosocial factors"
          className="min-h-[100px]"
          value={formData.psychosocialFactors}
          onChange={(e) => onChange("psychosocialFactors", e.target.value)}
        />
      </div>
    </div>
  );
};

export default PatientInformation;