import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'student' | 'ai';
  content: string;
  timestamp: Date;
}

interface ClinicalInquiryProps {
  onAskQuestion: (question: string) => Promise<void>;
  isLoading: boolean;
  caseContext: string;
}

export function ClinicalInquiry({ onAskQuestion, isLoading, caseContext }: ClinicalInquiryProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      // Add student's question to messages
      const newMessage: Message = {
        role: 'student',
        content: question,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('clinical-reasoning', {
        body: {
          question,
          caseStudy: caseContext,
          learningHistory: messages
        }
      });

      if (error) throw error;
      
      // Add AI's response to messages
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.response,
        timestamp: new Date()
      }]);

      setQuestion("");
    } catch (error) {
      console.error('Error in clinical inquiry:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process your question. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Clinical Inquiry</h3>
      </div>

      <ScrollArea className="h-[400px] rounded-md border p-4">
        {messages.map((message, index) => (
          <Card key={index} className={`mb-4 ${message.role === 'ai' ? 'bg-muted' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">
                  {message.role === 'student' ? 'You' : 'Clinical Educator'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
      
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