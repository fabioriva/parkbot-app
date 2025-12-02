import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function Error({ error }) {
  // console.log(error?.name, error?.message);
  return (
    <div className="grid max-w-xl items-start gap-4">
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>{"error.message"}</AlertTitle>
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
