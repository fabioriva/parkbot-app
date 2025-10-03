import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function Error() {
  return (
    <div className="grid w-full max-w-xl items-start gap-4">
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Fetch error</AlertTitle>
        <AlertDescription>
          <p>Resource not available.</p>
          <ul className="list-inside list-disc text-sm">
            <li>Check your internet connection</li>
            <li>Check that PLC is connected</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
