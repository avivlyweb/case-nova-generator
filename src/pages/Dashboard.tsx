import { useQuery } from "@tanstack/react-query";
import { getCaseStudies } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import MedicalEntitiesChart from "@/components/dashboard/MedicalEntitiesChart";
import { ConditionsChart } from "@/components/dashboard/ConditionsChart";
import { AgeDistributionChart } from "@/components/dashboard/AgeDistributionChart";
import { TimelineChart } from "@/components/dashboard/TimelineChart";
import { InterventionChart } from "@/components/dashboard/InterventionChart";
import { RecentCasesTable } from "@/components/dashboard/RecentCasesTable";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { toast } = useToast();
  const { data: caseStudies, isLoading, error } = useQuery({
    queryKey: ['case-studies'],
    queryFn: getCaseStudies,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-[300px]" />
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

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1600px] mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-primary">Analytics Dashboard</h1>
      
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        <div className="col-span-1 md:col-span-2 xl:col-span-1">
          <ConditionsChart conditionData={conditionData} />
        </div>
        <div className="col-span-1">
          <AgeDistributionChart ageData={ageData} />
        </div>
        <div className="col-span-1">
          <TimelineChart timelineData={timelineChartData} />
        </div>
        <div className="col-span-1">
          <InterventionChart interventionData={interventionData} />
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
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <RecentCasesTable caseStudies={caseStudies || []} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;