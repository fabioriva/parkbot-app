import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { UserRound } from "lucide-react";

function hashStringToNumber(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash);
}

function stringToHsl(str: string, s = 60, l = 55) {
  const num = hashStringToNumber(str);
  const hue = num % 360;
  return `hsl(${hue} ${s}% ${l}%)`;
}

export function DeviceAvatar({ device }) {
  const bg = stringToHsl(device.key);
  return (
    <Avatar size="lg">
      {device.id !== 0 ? (
        <AvatarFallback
          className="text-xs" 
          style={{
            // backgroundColor: bg,
            color: bg,
          }}
        >
          {device.key}
        </AvatarFallback>
      ) : (
        <AvatarFallback
          style={{
            // backgroundColor: bg,
            color: "white",
          }}
        >
          <UserRound size={20} />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
