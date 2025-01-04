import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Activity, Users } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-between gap-12 py-16">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Generate Professional
            <span className="block">Case Studies with AI</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-[600px]">
            Create evidence-based physiotherapy case studies in minutes. Perfect for education,
            clinical practice, and professional development.
          </p>
          <div className="flex gap-4 pt-4">
            <Link to="/generate">
              <Button size="lg" className="group">
                Start Creating
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/case-studies">
              <Button size="lg" variant="outline">
                View Examples
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-3xl" />
          <div className="relative aspect-square max-w-[500px] mx-auto overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
              alt="Healthcare Professional"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-12">Why PhysioCase?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "AI-Powered",
              description:
                "Leverage advanced AI to generate comprehensive, evidence-based case studies",
              image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7"
            },
            {
              icon: Activity,
              title: "Clinical Accuracy",
              description:
                "Ensure your case studies are clinically accurate and follow best practices",
              image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
            },
            {
              icon: Users,
              title: "Educational Value",
              description:
                "Perfect for students, educators, and healthcare professionals",
              image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334"
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl border bg-card transition-all hover:shadow-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
                <div className="mt-4 h-40 overflow-hidden rounded-lg">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center border-t relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1721322800607-8c38375eef04"
            alt="Background"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground">
            Join healthcare professionals worldwide in creating high-quality case studies
          </p>
          <Link to="/generate">
            <Button size="lg" className="mt-4">
              Create Your First Case Study
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;