import { useQuery } from "@tanstack/react-query";
import { getCaseStudies } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import MedicalEntitiesChart from "@/components/dashboard/MedicalEntitiesChart";
import { ConditionsChart } from "@/components/dashboard/ConditionsChart";
import { AgeDistributionChart } from "@/components/dashboard/AgeDistributionChart";
import { TimelineChart } from "@/components/dashboard/TimelineChart";
import { InterventionChart } from "@/components/dashboard/InterventionChart";
import { RecentCasesTable } from "@/components/dashboard/RecentCasesTable";
import { ICFClassificationChart } from "@/components/dashboard/ICFClassificationChart";
import { Skeleton } from "@/components/ui/skeleton";
import MetricsCards from "@/components/dashboard/MetricsCards";
import QuickActions from "@/components/dashboard/QuickActions";

const Dashboard = () => {
  const { toast } = useToast();
  const { data: caseStudies, isLoading, error } = useQuery({
    queryKey: ['case-studies'],
    queryFn: getCaseStudies,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-[300px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load dashboard data",
    });
    return null;
  }

  // Process data for visualizations
  const conditionStats = caseStudies?.reduce((acc: Record<string, number>, study) => {
    if (study.condition) {
      acc[study.condition] = (acc[study.condition] || 0) + 1;
    }
    return acc;
  }, {});

  const conditionData = Object.entries(conditionStats || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Process age group data
  const ageGroups = caseStudies?.reduce((acc: Record<string, number>, study) => {
    const ageGroup = `${Math.floor(study.age / 10) * 10}-${Math.floor(study.age / 10) * 10 + 9}`;
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {});

  const ageData = Object.entries(ageGroups || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Process timeline data
  const timelineData = caseStudies?.reduce((acc: Record<string, number>, study) => {
    const month = new Date(study.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const timelineChartData = Object.entries(timelineData || {}).map(([date, count]) => ({
    date,
    cases: count,
  }));

  // Process intervention data for radar chart
  const interventionCategories = ['Assessment', 'Treatment', 'Rehabilitation', 'Prevention', 'Education'];
  const interventionData = interventionCategories.map(category => ({
    category,
    value: caseStudies?.filter(study => 
      study.intervention_plan?.toLowerCase().includes(category.toLowerCase())
    ).length || 0,
  }));

  // Get recent cases for quick actions
  const recentCases = caseStudies
    ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5) || [];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="space-y-2">
        <h1 className="text-medical-heading">Analytics Dashboard</h1>
        <p className="text-medical-body">Overview of your case studies and clinical data</p>
      </div>

      {/* Metrics Cards */}
      <MetricsCards caseStudies={caseStudies || []} />

      {/* Quick Actions */}
      <QuickActions recentCases={recentCases} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-2">
          <TimelineChart timelineData={timelineChartData} />
        </div>
        <div className="col-span-1">
          <ConditionsChart conditionData={conditionData} />
        </div>
        <div className="col-span-1">
          <AgeDistributionChart ageData={ageData} />
        </div>
        <div className="col-span-1">
          <InterventionChart interventionData={interventionData} />
        </div>
        <div className="col-span-1">
          <ICFClassificationChart caseStudies={caseStudies || []} />
        </div>
        <div className="col-span-1">
          <MedicalEntitiesChart 
            medicalEntities={caseStudies
              ?.map(study => study.medical_entities)
              .filter((entities): entities is NonNullable<typeof entities> => 
                entities !== null && entities !== undefined
              ) || []}
          />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <RecentCasesTable caseStudies={caseStudies || []} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;