// import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
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
  // const bg = stringToHslColor(initials);
  return (
    <div className="flex aspect-square size-10 items-center justify-center rounded-lg">
      <img
        src={
          user.image ||
          `https://api.dicebear.com/10.x/bottts/svg?seed=${user.name}`
        }
        alt={initials}
      />
    </div>
  );
  // return (
  //   <Avatar className="rounded-full">
  //     <AvatarImage
  //       src={
  //         user.image ||
  //         `https://api.dicebear.com/10.x/bottts/svg?seed=${user.name}`
  //       }
  //       alt={initials}
  //     />
  //     <AvatarFallback style={{ backgroundColor: bg, color: "white" }}>
  //       {initials}
  //     </AvatarFallback>
  //   </Avatar>
  // );
}
