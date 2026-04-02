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

// function hashStringToNumber(str: string) {
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     hash = str.charCodeAt(i) + ((hash << 5) - hash);
//     hash |= 0;
//   }
//   return Math.abs(hash);
// }

// function stringToHsl(str: string, s = 60, l = 55) {
//   const num = hashStringToNumber(str);
//   const hue = num % 360;
//   return `hsl(${hue} ${s}% ${l}%)`;
// }

export function DeviceAvatar({ device, operation }) {
  // console.log(device, operation);
  // const bg = stringToHsl(device.key);
  return (
    <Avatar size="lg">
      {device.id !== 0 ? (
        <AvatarFallback
          // className="text-xs"
          // style={{
          //   // backgroundColor: bg,
          //   // color: bg,
          // }}
        >
          {/* {device.key} */}
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
            <Tag
              data-icon="inline-start"
              className="size-5 text-blue-500"
            />
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
        <AvatarFallback
          // style={{
          //   // backgroundColor: bg,
          //   // color: "white",
          // }}
        >
          <User className="size-5 text-muted-foreground" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
