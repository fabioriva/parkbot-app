import type { PropsWithChildren } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface CardWrapperProps {
  className?: string;
  description: string;
  link: string;
  title: string;
}

export function CardWrapper({
  className,
  description,
  link,
  title,
  children,
}: PropsWithChildren<CardWrapperProps>) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button className="hover:cursor-pointer" variant="link" asChild>
            <a href={link}>More</a>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
