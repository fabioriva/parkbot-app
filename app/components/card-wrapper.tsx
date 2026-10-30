import * as React from "react"
import { cn } from "~/lib/utils"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import "./card-wrapper.css"

interface CardWrapperProps {
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  description?: string
  footer?: React.ReactNode
  title?: string
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
    <Card className={cn("card-wrapper", className)} size="sm">
      {(title || description || action) && (
        <CardHeader className="card-wrapper-header">
          {(title || description) && (
            <div className="card-wrapper-heading">
              {title && (
                <CardTitle className="card-wrapper-title">{title}</CardTitle>
              )}
              {description && (
                <CardDescription className="card-wrapper-description">
                  {description}
                </CardDescription>
              )}
            </div>
          )}
          {action && (
            <CardAction className="card-wrapper-action">{action}</CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className="card-wrapper-content">{children}</CardContent>
      {footer && (
        <CardFooter className="card-wrapper-footer">{footer}</CardFooter>
      )}
    </Card>
  )
}
