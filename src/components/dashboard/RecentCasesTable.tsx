import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";

interface RecentCasesTableProps {
  caseStudies: Array<{
    id: string;
    patient_name: string;
    age: number;
    condition: string;
    date: string;
  }>;
}

export const RecentCasesTable = ({ caseStudies }: RecentCasesTableProps) => {
  return (
    <Card className="md:col-span-2 hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            Recent Cases
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-primary-100 dark:bg-primary-900">
              <tr>
                <th className="px-6 py-3 font-medium">Patient</th>
                <th className="px-6 py-3 font-medium">Age</th>
                <th className="px-6 py-3 font-medium">Condition</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {caseStudies?.slice(0, 5).map((study) => (
                <tr key={study.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
  );
};