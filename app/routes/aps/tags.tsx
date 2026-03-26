import { Tag as TagIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { useData } from "~/hooks/use-ws";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/tags";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.VITE_BACKEND_URL}/${params?.aps}/cards`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

const Tag = ({ tag, handleEdit }) => (
  <Item className="" variant="outline">
    <ItemMedia variant="icon">
      <TagIcon />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>Tag {tag.nr} {tag.code !== "0" && `PIN ${tag.code}`}</ItemTitle>
      <ItemDescription>
        {tag.status === 0 ? "Valid for entry" : `Parked in slot ${tag.status}`}
      </ItemDescription>
    </ItemContent>
    <ItemActions>
      <Button size="sm" variant="outline" onClick={() => handleEdit(tag)}>
        Edit
      </Button>
    </ItemActions>
  </Item>
);

export default function Tags({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData)
    return (
      <h1 className="text-lg dark:text-red-500 font-semibold">
        Data not available!
      </h1>
    );
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/cards`;
  const { data } = useData(url, { initialData: loaderData });
  const handleEdit = (tag) => {
    console.log(tag);
  };
  // return (
  //   <div>
  //     <h2>Data</h2>
  //     <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
  //   </div>
  // );

  return (
    // <ItemGroup className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
    <ItemGroup className="max-w-sm gap-3">
      {data.map((item) => (
        <Tag handleEdit={handleEdit} tag={item} key={item.nr} />
      ))}
    </ItemGroup>
  );
}
