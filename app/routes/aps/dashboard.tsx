import type { Route } from "./+types/dashboard";

export async function loader({ params }: Route.LoaderArgs) {
  console.log(params);
}

export default function Dashboard({ params }: Route.ComponentProps) {
  return (
    <>
      <h1>
        Aps = <span className="capitalize">{params.aps}</span>
      </h1>
    </>
  );
}
