import clsx from "clsx";
import {
  ArrowLeft,
  ArrowRight,
  BadgeAlert,
  BadgeCheck,
  Tag,
  User,
  Wrench,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function OperationsAvatar({ device, operation }) {
  // console.log(device, operation);
  return (
    <Avatar size="smdefault">
      {device.id !== 0 ? (
        <AvatarFallback>
          {operation.id === 1 && (
            <BadgeAlert
              data-icon="inline-start"
              className="size-5 text-red-500"
            />
          )}
          {operation.id === 2 && (
            <BadgeCheck
              data-icon="inline-start"
              className="size-5 text-green-500"
            />
          )}
          {operation.id === 3 && (
            <Wrench
              data-icon="inline-start"
              className="size-5 text-amber-500"
            />
          )}
          {operation.id === 4 && (
            <Tag data-icon="inline-start" className="size-5 text-blue-500" />
          )}
          {operation.id === 5 && (
            <ArrowRight
              data-icon="inline-start"
              className="size-5 text-muted-foreground"
            />
          )}
          {operation.id === 6 && (
            <ArrowLeft
              data-icon="inline-start"
              className="size-5 text-muted-foreground"
            />
          )}
          {operation.id === 7 && (
            <ArrowRight
              data-icon="inline-start"
              className="size-5 text-muted-foreground"
            />
          )}
          {operation.id === 8 && (
            <ArrowLeft
              data-icon="inline-start"
              className="size-5 text-muted-foreground"
            />
          )}
        </AvatarFallback>
      ) : (
        <AvatarFallback>
          <User className="size-5 text-muted-foreground" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
