import { IoInfo } from "~/components/io-info";
import { useData } from "~/hooks/use-ws";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/nodes";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.BACKEND_URL}/${params?.aps}/racks/${params?.nr}`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function Rack({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData)
    return (
      <h1 className="text-lg dark:text-red-500 font-semibold">
        Data not available!
      </h1>
    );
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/racks/${params.nr}`;
  const { data } = useData(url, { initialData: loaderData });

  // return (
  //   <div>
  //     <h2>Data</h2>
  //     <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
  //   </div>
  // );

  return (
    <div className="flex overflow-scroll gap-0.5 py-3">
      {data.cards.map((card) => (
        <div
          className="bg-sidebar flex flex-col gap-0.5 border rounded-xs p-1 text-xs"
          key={card.nr}
        >
          <p className="text-[0.625rem]">{card.type}</p>
          {card.bytes.map((byte) => (
            <div className="flex flex-col gap-0.5" key={byte.label}>
              <p className="mt-1.5">
                {byte.label.substring(0, 1) + "B" + byte.label.substring(1)}
              </p>
              {byte.bits.map((bit) => (
                <IoInfo io={bit} key={bit.addr}>
                  {/* <div className="flex border bg-white text-black"> */}
                  <div className="flex border">
                    <span className="w-12">{bit.addr}</span>
                    <span className="w-16">{bit.label}</span>
                    <span
                      className={`w-3 text-center ${bit.status ? "bg-green-300 text-green-950 dark:bg-green-950 dark:text-green-300" : "bg-neutral-300 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-300"}`}
                    >
                      {bit.addr.slice(-1)}
                    </span>
                  </div>
                </IoInfo>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
