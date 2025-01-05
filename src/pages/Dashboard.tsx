import { useQuery } from "@tanstack/react-query";
import { getCaseStudies } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { ChartBar, ChartPie, List, TrendingUp, Target } from "lucide-react";
import MedicalEntitiesChart from "@/components/dashboard/MedicalEntitiesChart";

// ... keep existing code (imports and component start)

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
        <div className="grid gap-6 md:grid-cols-2">
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-primary">Analytics Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Conditions Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center gap-2">
                <ChartPie className="h-5 w-5 text-primary" />
                Conditions Distribution
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {conditionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center gap-2">
                <ChartBar className="h-5 w-5 text-primary" />
                Age Distribution
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0A2540" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cases Timeline */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Cases Timeline
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cases" 
                    stroke="#0A2540" 
                    name="Number of Cases"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Intervention Focus Areas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Intervention Focus Areas
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={interventionData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Interventions"
                    dataKey="value"
                    stroke="#0A2540"
                    fill="#0A2540"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Medical Entities Chart */}
        <MedicalEntitiesChart 
          medicalEntities={caseStudies?.map(study => study.medical_entities).filter(Boolean) || []}
        />

        {/* Recent Cases Table */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                Recent Cases
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-primary-100 dark:bg-primary-900">
                  <tr>
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-6 py-3">Age</th>
                    <th className="px-6 py-3">Condition</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {caseStudies?.slice(0, 5).map((study) => (
                    <tr key={study.id} className="bg-white dark:bg-gray-800 border-b">
                      <td className="px-6 py-4">{study.patient_name}</td>
                      <td className="px-6 py-4">{study.age}</td>
                      <td className="px-6 py-4">{study.condition}</td>
                      <td className="px-6 py-4">{new Date(study.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
