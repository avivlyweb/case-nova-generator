import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

const Feedback = () => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      // Implement feedback submission logic here
      toast.success("Thank you for your feedback!");
      setFeedback("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-8">Provide Feedback</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="feedback"
            className="block text-sm font-medium text-gray-700"
          >
            Your Feedback
          </label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what you think about PhysioCase..."
            className="min-h-[200px]"
          />
        </div>
        
        <Button
          type="submit"
          className="w-full bg-secondary hover:bg-secondary/90"
          disabled={!feedback.trim()}
        >
          Submit Feedback
        </Button>
      </form>
    </div>
  );
};

export default Feedback;