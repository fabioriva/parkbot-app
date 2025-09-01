import { Loader2Icon } from "lucide-react";
import { useNavigation } from "react-router";
import { Button } from "~/components/ui/button";

export default function SubmitFormButton({
  action,
  title,
}: SubmitFormButtonProps) {
  const navigation = useNavigation();
  return (
    <>
      {navigation.formAction === action ? (
        <Button size="sm" disabled>
          <Loader2Icon className="animate-spin" />
          {title}
        </Button>
      ) : (
        <Button type="submit">{title}</Button>
      )}
    </>
  );
}

interface SubmitFormButtonProps {
  action: string;
  title: string;
}
