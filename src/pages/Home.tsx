import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          Welcome to PhysioCase
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Generate comprehensive physiotherapy case studies with AI assistance.
          Streamline your documentation and enhance your clinical reasoning.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/generate">
              Generate New Case Study
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/case-studies">
              View My Case Studies
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;