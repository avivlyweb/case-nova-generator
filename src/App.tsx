import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CaseStudies from "./pages/CaseStudies";
import Generate from "./pages/Generate";
import Feedback from "./pages/Feedback";
import About from "./pages/About";
import ClinicalLearning from "./pages/ClinicalLearning";

// Import the new page
import GenerateFullCasePage from './pages/GenerateFullCasePage';

// In your Routes component, add a new route:
<Route path="/generate-full-case" element={<GenerateFullCasePage />} />

// Don't forget to add a link to this page from your CaseStudiesPage.tsx:
// <Button onClick={() => navigate('/generate-full-case')}>Create Full Case Study</Button>


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:id/learn" element={<ClinicalLearning />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;