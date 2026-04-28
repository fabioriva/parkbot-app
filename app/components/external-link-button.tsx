import { ArrowUpRightIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

export function ExternalLink({ link }) {
  return (
    <Button variant="ghost" size="icon" asChild>
      <a href={link}>
        <ArrowUpRightIcon />
      </a>
    </Button>
  );
}
