import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function Error({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <Alert variant="destructive" className="my-3">
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div dangerouslySetInnerHTML={{ __html: description }} />
      </AlertDescription>
    </Alert>
  );
}
