import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function DeviceInfo() {
  return (
    <Alert className="text-green-600">
      <CheckCircle2Icon />
      <AlertTitle>Success! Your changes have been saved</AlertTitle>
      <AlertDescription>
        This is an alert with icon, title and description.
      </AlertDescription>
    </Alert>
  );
}
