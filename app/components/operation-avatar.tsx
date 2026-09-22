import {
  // ArrowLeft,
  // ArrowRight,
  BadgeAlert,
  BadgeCheck,
  Bookmark,
  Car,
  Tag,
  User,
  Wrench,
} from "lucide-react"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import { cn } from "~/lib/utils"

export function OperationsAvatar({ device, operation }) {
  const error = "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
  const success =
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
  const warning =
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
  const info = "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
  return (
    <Avatar>
      {device?.id !== 0 ? (
        <AvatarFallback
          className={cn({
            [error]: operation?.id === 1,
            [success]: operation?.id === 2,
            [warning]:
              operation?.id === 3 ||
              operation?.id === 4 ||
              [9, 10, 11, 12, 13, 14].includes(operation?.id),
            [info]: [5, 6, 7, 8].includes(operation?.id),
          })}
        >
          {operation?.id === 1 && (
            <BadgeAlert data-icon="inline-start" className="size-5" />
          )}
          {operation?.id === 2 && (
            <BadgeCheck data-icon="inline-start" className="size-5" />
          )}
          {operation?.id === 3 && (
            <Wrench data-icon="inline-start" className="size-5" />
          )}
          {operation?.id === 4 && (
            <Tag data-icon="inline-start" className="size-5" />
          )}
          {operation?.id === 5 && (
            <Car data-icon="inline-start" className="size-5" />
          )}
          {operation?.id === 6 && (
            <Car data-icon="inline-start" className="size-5 -scale-x-100" />
          )}
          {operation?.id === 7 && (
            <Car data-icon="inline-start" className="size-5" />
          )}
          {operation?.id === 8 && (
            <Car data-icon="inline-start" className="size-5 -scale-x-100" />
          )}
          {operation?.id >= 9 && operation?.id <= 14 && (
            <Bookmark data-icon="inline-start" className="size-5" />
          )}
        </AvatarFallback>
      ) : (
        <AvatarFallback>
          <User className="size-5 text-muted-foreground" />
        </AvatarFallback>
      )}
    </Avatar>
  )
}
