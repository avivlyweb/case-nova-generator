import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Activity, Users, BookOpen, ChartBar, MessageSquare } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary mb-6 leading-tight">
            Your AI-Powered Physiotherapy<br />Case Study Builder
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Welcome to EBPcharlie: Your AI companion for creating realistic, evidence-based case studies across various physiotherapy specializations.
          </p>
          <Link to="/generate">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white px-8 py-6 text-lg rounded-full">
              Create New Case Study <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="w-10 h-10 text-secondary" />}
            title="AI-Powered Analysis"
            description="Generate comprehensive case studies backed by the latest research and clinical guidelines"
          />
          <FeatureCard
            icon={<Activity className="w-10 h-10 text-secondary" />}
            title="Multiple Specializations"
            description="Cover various fields including Orthopedic, Neurological, Cardiovascular, and more"
          />
          <FeatureCard
            icon={<Users className="w-10 h-10 text-secondary" />}
            title="Patient-Centered"
            description="Create detailed patient scenarios with realistic presentations and outcomes"
          />
        </div>
      </div>

      {/* Specializations Section */}
      <div className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Available Specializations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              "Orthopedic 🦴",
              "Neurological 🧠",
              "Cardiovascular ❤️",
              "Pediatric 🧒",
              "Geriatric 🧓",
              "ICU 🏥"
            ].map((spec) => (
              <div key={spec} className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
                <p className="font-medium text-gray-700">{spec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <BenefitCard
            icon={<BookOpen className="w-8 h-8 text-primary" />}
            title="Evidence-Based Learning"
            description="Access the latest research and clinical guidelines"
          />
          <BenefitCard
            icon={<ChartBar className="w-8 h-8 text-primary" />}
            title="Track Progress"
            description="Monitor your learning journey with detailed analytics"
          />
          <BenefitCard
            icon={<MessageSquare className="w-8 h-8 text-primary" />}
            title="Continuous Feedback"
            description="Help improve EBPcharlie with your valuable insights"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-lg mb-8 opacity-90">
            Create your first case study today and experience the power of AI-assisted learning
          </p>
          <Link to="/generate">
            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg rounded-full">
              Get Started Now <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const BenefitCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

export default Home;