import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ClinicalInquiryProps {
  caseContext: string;
  onAskQuestion: (question: string) => Promise<any>;
  isLoading: boolean;
}

export function ClinicalInquiry({ caseContext, onAskQuestion, isLoading }: ClinicalInquiryProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: caseContext }
  ]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const newQuestion = question;
    setQuestion("");
    setMessages(prev => [...prev, { role: "user", content: newQuestion }]);

    try {
      const { data, error } = await supabase.functions.invoke('clinical-reasoning', {
        body: { 
          question: newQuestion, 
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw error;

      if (data?.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        throw new Error('No response received from the AI');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process your question. Please try again.",
      });
      // Remove the user's question if it failed
      setMessages(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 h-[400px] overflow-y-auto p-4 rounded-lg border">
        {messages.map((message, index) => (
          <Card key={index} className={`p-4 ${
            message.role === "assistant" ? "bg-primary-50 dark:bg-primary-900/10" : "bg-white dark:bg-gray-800"
          }`}>
            <p className="text-sm">
              {message.content}
            </p>
          </Card>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the case..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !question.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}