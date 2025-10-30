import { Error } from "~/components/error";

export async function loader({ params }: Route.LoaderArgs) {
  // console.log(params);
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/tags`;
  const data = await fetcher(url);
  return { data };
}

export default function Tags({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData?.data) return <Error />;
  return (
    <div>
      <h1>Tags</h1>
    </div>
  );
}
