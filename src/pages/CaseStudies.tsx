import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CaseStudies = () => {
  // This would normally fetch from an API/database
  const mockCaseStudies = [
    {
      id: 1,
      patientName: "John Doe",
      condition: "Lower Back Pain",
      date: "2024-03-15",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      condition: "Shoulder Impingement",
      date: "2024-03-14",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">My Case Studies</h1>
      <div className="grid gap-6">
        {mockCaseStudies.map((study) => (
          <Card key={study.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                Case Study: {study.patientName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Condition: {study.condition}</p>
              <p className="text-gray-600">Date: {study.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CaseStudies;