import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { PlusCircle, FileText, BarChart3, Download, Share2, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface CaseStudy {
  id: string;
  date: string;
  patient_name: string;
  condition: string;
  specialization: string;
}

interface QuickActionsProps {
  recentCases: CaseStudy[];
}

export const QuickActions = ({ recentCases }: QuickActionsProps) => {
  const quickActionButtons = [
    {
      title: "Generate New Case",
      description: "Create a new case study",
      icon: <PlusCircle className="w-5 h-5" />,
      href: "/generate",
      color: "bg-medical-gradient text-white",
      hoverColor: "hover:shadow-lg"
    },
    {
      title: "View All Cases",
      description: "Browse your case library",
      icon: <FileText className="w-5 h-5" />,
      href: "/case-studies",
      color: "bg-white border border-primary/20 text-primary",
      hoverColor: "hover:bg-primary/5"
    },
    {
      title: "Export Data",
      description: "Download your analytics",
      icon: <Download className="w-5 h-5" />,
      href: "#",
      color: "bg-white border border-gray-200 text-gray-700",
      hoverColor: "hover:bg-gray-50"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Quick Actions */}
      <Card className="card-medical">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActionButtons.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link to={action.href}>
                <Button
                  className={`w-full justify-start space-x-3 h-auto py-3 px-4 ${action.color} ${action.hoverColor} transition-all duration-200`}
                  variant="ghost"
                >
                  {action.icon}
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs opacity-80">{action.description}</div>
                  </div>
                </Button>
              </Link>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Cases */}
      <Card className="card-medical">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>Recent Cases</span>
            </div>
            <Link to="/case-studies">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCases.length > 0 ? (
            <div className="space-y-3">
              {recentCases.slice(0, 4).map((caseStudy, index) => (
                <motion.div
                  key={caseStudy.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {caseStudy.patient_name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {caseStudy.specialization}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {caseStudy.condition}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(caseStudy.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No case studies yet</p>
              <Link to="/generate">
                <Button className="btn-medical">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Your First Case
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;