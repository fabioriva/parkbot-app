import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

const colors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function stringToColorIndex(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % colors.length;
}

function stringToHslColor(str: string, s = 65, l = 55) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function UserAvatar({ user }) {
  const initials = getInitials(user.name);
  const bg = stringToHslColor(initials);
  return (
    <Avatar className="rounded-full">
      <AvatarImage src={user.image} alt={initials} />
      <AvatarFallback
        // className={`${colors[stringToColorIndex(initials)]} text-white`}
        style={{ backgroundColor: bg, color: "white" }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
