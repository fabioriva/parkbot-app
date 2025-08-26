import type { Route } from "./+types/aps";

export async function loader({ params }: Route.LoaderArgs) {
  console.log(params);
}

export default function Component({ params }: Route.ComponentProps) {
  return (
    <h1>
      Aps = <span className="capitalize">{params.aps}</span>
    </h1>
  );
}
