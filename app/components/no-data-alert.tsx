import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function NoDataAlert() {
  return (
    <Alert variant="destructive" className="max-w-md">
      <AlertCircleIcon />
      <AlertTitle>Data not available</AlertTitle>
      <AlertDescription>
        No data available at the moment. Please try again later.
      </AlertDescription>
    </Alert>
  );
}
