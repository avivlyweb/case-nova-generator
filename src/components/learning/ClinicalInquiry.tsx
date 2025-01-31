import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";

interface ClinicalInquiryProps {
  onAskQuestion: (question: string) => Promise<void>;
  isLoading: boolean;
}

export function ClinicalInquiry({ onAskQuestion, isLoading }: ClinicalInquiryProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    await onAskQuestion(question);
    setQuestion("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Clinical Inquiry</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the case..."
          className="min-h-[100px]"
        />
        <Button 
          type="submit" 
          disabled={!question.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? (
            "Processing..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Ask Question
            </>
          )}
        </Button>
      </form>
    </div>
  );
}