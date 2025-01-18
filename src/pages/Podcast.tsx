import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, Play, Download, Settings } from "lucide-react";

const Podcast = () => {
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Podcast Studio</h1>
            <p className="text-muted-foreground mt-2">
              Transform your case studies into engaging audio content
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Generate New Podcast</h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Case Study
              </label>
              <Select
                value={selectedCase}
                onValueChange={setSelectedCase}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a case study" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="case1">Case Study #1</SelectItem>
                  <SelectItem value="case2">Case Study #2</SelectItem>
                  <SelectItem value="case3">Case Study #3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Narrator Voice
              </label>
              <Select
                value={selectedVoice}
                onValueChange={setSelectedVoice}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="charlie">Dr. Charlie (Narrator)</SelectItem>
                  <SelectItem value="sarah">Dr. Sarah (Clinical)</SelectItem>
                  <SelectItem value="george">Dr. George (Medical)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button className="w-full gap-2" size="lg">
                <Mic className="w-4 h-4" />
                Generate Podcast
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="bg-secondary/10 rounded-lg p-6 flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Generate a podcast to preview it here
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" size="icon" disabled>
                  <Play className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" disabled>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Podcast;