import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-8">About PhysioCase</h1>
      
      <Card>
        <CardContent className="prose prose-blue max-w-none pt-6">
          <p className="text-lg text-gray-600 mb-6">
            PhysioCase is an innovative tool designed to assist physiotherapists,
            students, and educators in creating evidence-based case studies.
          </p>
          
          <h2 className="text-xl font-semibold text-primary mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            To enhance physiotherapy education and clinical practice through
            comprehensive, evidence-based case study generation.
          </p>
          
          <h2 className="text-xl font-semibold text-primary mb-4">Features</h2>
          <ul className="list-disc pl-6 text-gray-600 mb-6">
            <li>Evidence-based case study generation</li>
            <li>Comprehensive patient information templates</li>
            <li>Professional documentation format</li>
            <li>Easy-to-use interface</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-primary mb-4">Contact</h2>
          <p className="text-gray-600">
            For support or inquiries, please email us at support@physiocase.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;