import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { PropsWithChildren } from "react";

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
  const { t } = useTranslation();
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button
            className="hover:no-underline hover:text-blue-700"
            variant="link"
            asChild
          >
            <a href={link}>{t("aps.more")}</a>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
