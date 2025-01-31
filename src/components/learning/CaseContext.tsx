import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CaseContextProps {
  initialContext: string;
  loading?: boolean;
}

export function CaseContext({ initialContext, loading }: CaseContextProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Format the initial context to show only essential information
  const formatInitialContext = (context: string) => {
    const lines = context.split('\n');
    const basicInfo = lines.filter(line => 
      line.includes('age') || 
      line.includes('chief complaint') || 
      line.includes('presenting') ||
      line.includes('main concern')
    ).join('\n');
    
    return basicInfo || context;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initial Case Presentation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {formatInitialContext(initialContext)}
        </p>
        <p className="mt-4 text-sm text-muted-foreground italic">
          Ask questions to gather more information about the case.
        </p>
      </CardContent>
    </Card>
  );
}