import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-primary">
          Case Nova Generator
        </h1>
        <p className="text-xl text-muted-foreground">
          Generate comprehensive case studies with evidence-based insights and Dutch clinical guidelines integration.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/generate")}
            className="w-full sm:w-auto"
          >
            Generate Case Study
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/case-studies")}
            className="w-full sm:w-auto"
          >
            View Case Studies
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;