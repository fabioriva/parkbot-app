import { Loader2Icon } from "lucide-react";
import { useNavigation } from "react-router";
import { Button } from "~/components/ui/button";

export function Submit({ action, title }: SubmitButtonProps) {
  const navigation = useNavigation();
  return (
    <>
      {navigation.formAction === action ? (
        <Button disabled>
          <Loader2Icon className="animate-spin" />
          {title}
        </Button>
      ) : (
        <Button type="submit">{title}</Button>
      )}
    </>
  );
}

interface SubmitButtonProps {
  action: string;
  title: string;
}
