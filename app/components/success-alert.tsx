import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function Success({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <Alert className="my-3 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
      <CheckCircle2Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div dangerouslySetInnerHTML={{ __html: description }} />
      </AlertDescription>
    </Alert>
  );
}
