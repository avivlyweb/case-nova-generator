import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Clock, Target, Users, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface CaseStudy {
  id: string;
  date: string;
  specialization: string;
  condition: string;
  patient_name: string;
  age: number;
}

interface MetricsCardsProps {
  caseStudies: CaseStudy[];
}

export const MetricsCards = ({ caseStudies }: MetricsCardsProps) => {
  // Calculate metrics
  const totalCases = caseStudies.length;
  
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const casesThisMonth = caseStudies.filter(study => {
    const studyDate = new Date(study.date);
    return studyDate.getMonth() === thisMonth && studyDate.getFullYear() === thisYear;
  }).length;

  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
  const casesLastMonth = caseStudies.filter(study => {
    const studyDate = new Date(study.date);
    return studyDate.getMonth() === lastMonth && studyDate.getFullYear() === lastMonthYear;
  }).length;

  const monthlyGrowth = casesLastMonth > 0 
    ? ((casesThisMonth - casesLastMonth) / casesLastMonth) * 100 
    : casesThisMonth > 0 ? 100 : 0;

  // Most common specialization
  const specializationCounts = caseStudies.reduce((acc, study) => {
    acc[study.specialization] = (acc[study.specialization] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSpecialization = Object.entries(specializationCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "None";

  // Average age
  const averageAge = caseStudies.length > 0 
    ? Math.round(caseStudies.reduce((sum, study) => sum + study.age, 0) / caseStudies.length)
    : 0;

  // Recent activity (cases in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCases = caseStudies.filter(study => 
    new Date(study.date) >= sevenDaysAgo
  ).length;

  const metrics = [
    {
      title: "Total Case Studies",
      value: totalCases.toString(),
      description: "All time cases created",
      icon: <FileText className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: null
    },
    {
      title: "This Month",
      value: casesThisMonth.toString(),
      description: "Cases created this month",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: {
        value: monthlyGrowth,
        isPositive: monthlyGrowth >= 0
      }
    },
    {
      title: "Recent Activity",
      value: recentCases.toString(),
      description: "Cases in last 7 days",
      icon: <Clock className="w-5 h-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: null
    },
    {
      title: "Top Specialization",
      value: topSpecialization,
      description: `${specializationCounts[topSpecialization] || 0} cases`,
      icon: <Target className="w-5 h-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: null
    },
    {
      title: "Average Patient Age",
      value: averageAge > 0 ? `${averageAge} yrs` : "N/A",
      description: "Across all case studies",
      icon: <Users className="w-5 h-5" />,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      trend: null
    },
    {
      title: "Completion Rate",
      value: "94%",
      description: "Cases fully processed",
      icon: <Activity className="w-5 h-5" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: {
        value: 2.5,
        isPositive: true
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="card-medical-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <div className={metric.color}>
                  {metric.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
                {metric.trend && (
                  <Badge 
                    variant={metric.trend.isPositive ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {metric.trend.isPositive ? "+" : ""}{metric.trend.value.toFixed(1)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default MetricsCards;