import type { PropsWithChildren } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface CardWrapperProps {
  description: string;
  title: string;
}

export function CardWrapper({
  className,
  description,
  title,
  children,
}: PropsWithChildren<CardWrapperProps>) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button variant="link">More</Button>
        </CardAction>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Vacant {free.value}, occupied {busy.value} and locked {lock.value}.
        </div>
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
}
