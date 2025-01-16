import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Activity, Users, BookOpen, ChartBar, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 via-white to-secondary-accent2">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16"
      >
        <div className="text-center">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-bold text-primary mb-6 leading-tight"
          >
            Your AI-Powered Physiotherapy<br />Case Study Builder
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Welcome to EBPcharlie: Your AI companion for creating realistic, evidence-based case studies across various physiotherapy specializations.
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/generate">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                Create New Case Study <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Brain className="w-10 h-10 text-secondary" />}
              title="AI-Powered Analysis"
              description="Generate comprehensive case studies backed by the latest research and clinical guidelines"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Activity className="w-10 h-10 text-secondary" />}
              title="Multiple Specializations"
              description="Cover various fields including Orthopedic, Neurological, Cardiovascular, and more"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Users className="w-10 h-10 text-secondary" />}
              title="Patient-Centered"
              description="Create detailed patient scenarios with realistic presentations and outcomes"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Specializations Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-primary-50 to-secondary-accent2 py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-primary mb-8 text-center"
          >
            Available Specializations
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              "Orthopedic 🦴",
              "Neurological 🧠",
              "Cardiovascular ❤️",
              "Pediatric 🧒",
              "Geriatric 🧓",
              "ICU 🏥"
            ].map((spec, index) => (
              <motion.div
                key={spec}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
                className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-all cursor-pointer"
              >
                <p className="font-medium text-gray-700">{spec}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Benefits Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div variants={itemVariants}>
            <BenefitCard
              icon={<BookOpen className="w-8 h-8 text-primary" />}
              title="Evidence-Based Learning"
              description="Access the latest research and clinical guidelines"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <BenefitCard
              icon={<ChartBar className="w-8 h-8 text-primary" />}
              title="Track Progress"
              description="Monitor your learning journey with detailed analytics"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <BenefitCard
              icon={<MessageSquare className="w-8 h-8 text-primary" />}
              title="Continuous Feedback"
              description="Help improve EBPcharlie with your valuable insights"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-primary to-primary-700 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-6"
          >
            Ready to Start Your Journey?
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg mb-8 opacity-90"
          >
            Create your first case study today and experience the power of AI-assisted learning
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/generate">
              <Button size="lg" variant="secondary" className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                Get Started Now <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all"
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const BenefitCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="flex items-start space-x-4"
  >
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </motion.div>
);

export default Home;