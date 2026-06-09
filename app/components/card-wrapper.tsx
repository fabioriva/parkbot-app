import * as React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface CardWrapperProps {
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  description?: string;
  footer?: React.ReactNode;
  title?: string;
}

export const CardWrapper: React.FC<CardWrapperProps> = ({
  action,
  children,
  className = "",
  description,
  footer,
  title,
}) => {
  return (
    <Card className={className} size="sm">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};
