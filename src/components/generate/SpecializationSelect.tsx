import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const physiotherapyTypes = [
  "Orthopedic",
  "Neurological",
  "Cardiovascular",
  "Pediatric",
  "Geriatric",
  "ICU",
  "Rheumatology"
];

export const aiRoleDescriptions = {
  Orthopedic: "As an Orthopedic Physiotherapist, focus on musculoskeletal issues.",
  Neurological: "As a Neurological Physiotherapist, focus on assessing and treating patients with neurological conditions. Consider the impact of muscle weakness, spasticity, balance impairments, and movement coordination deficits in your analysis.",
  Cardiovascular: "Specialize in cardiac rehab as a Cardiovascular Physiotherapist.",
  Pediatric: "As a Pediatric Physiotherapist, emphasize developmental stages and child-friendly communication.",
  Geriatric: "As a Geriatric Physiotherapist, focus on assessing and treating older adults.",
  ICU: "As an ICU Physiotherapist, provide rehabilitation for critically ill patients.",
  Rheumatology: "As a Rheumatology Physiotherapist, focus on helping patients achieve and sustain their highest level of independence and function. This involves comprehensive assessments, pain management, exercise therapy, manual therapy, hydrotherapy, physical modalities, patient education, and collaborative treatment planning."
};

interface SpecializationSelectProps {
  specialization: string;
  aiRole: string;
  onSpecializationChange: (value: string) => void;
  onAiRoleChange: (value: string) => void;
}

const SpecializationSelect = ({
  specialization,
  aiRole,
  onSpecializationChange,
  onAiRoleChange,
}: SpecializationSelectProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="specialization">Physiotherapy Specialization</Label>
        <Select
          name="specialization"
          value={specialization}
          onValueChange={(value) => {
            onSpecializationChange(value);
            onAiRoleChange(aiRoleDescriptions[value as keyof typeof aiRoleDescriptions]);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select specialization" />
          </SelectTrigger>
          <SelectContent>
            {physiotherapyTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aiRole">AI Role Description</Label>
        <Textarea
          id="aiRole"
          name="aiRole"
          value={aiRole}
          onChange={(e) => onAiRoleChange(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default SpecializationSelect;