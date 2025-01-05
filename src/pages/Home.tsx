import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Welcome to PhysioCase
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Generate evidence-based physiotherapy case studies with ease
        </p>
        <Link to="/generate">
          <Button size="lg" className="bg-secondary hover:bg-secondary/90">
            Create New Case Study
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Evidence-Based",
            description: "Generate case studies backed by latest research",
          },
          {
            title: "Comprehensive",
            description: "Detailed patient information and treatment plans",
          },
          {
            title: "Professional",
            description: "Perfect for education and clinical practice",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-primary mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;