import { CardWrapper } from "~/components/card-wrapper";
import { Device } from "~/components/device";
import { Error } from "~/components/error";
import { ExitQueue } from "~/components/exit-queue";
import { HistoryList } from "~/components/history-list";
import { ModeToggle } from "~/components/mode-toggle";
import { OccupancyChart } from "~/components/occupancy-chart";
import { OperationsBarChart } from "~/components/operations-bar-chart";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/dashboard";

export async function loader({ params }: Route.LoaderArgs) {
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/dashboard`;
  const data = await fetcher(url);
  return { data };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  // console.log(loaderData?.data);
  if (!loaderData?.data) return <Error />;

  const { activity, exitQueue, occupancy, operations, system } =
    loaderData?.data;
  const [busy, free, lock] = occupancy;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      <div className="col-span-2">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
          {system.map((item, key) => (
            <Device device={item} enhanced={false} key={key} />
          ))}
          <ExitQueue exit={exitQueue.exitButton} queue={exitQueue.queueList} />
        </div>
      </div>
      <div className="col-span-2">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
          <CardWrapper
            title="Pie Chart - Occupancy"
            description="Parking occupancy"
          >
            <OccupancyChart occupancy={occupancy} />
          </CardWrapper>
          <CardWrapper
            title="Recent activity"
            description={`Last ${activity.count} operations`}
          >
            <HistoryList history={activity.documents} />
          </CardWrapper>
          <CardWrapper
            title="Bar Chart - Operations"
            description="Parking operations"
            className="lg:col-span-2"
          >
            <OperationsBarChart operations={operations[0].data} />
          </CardWrapper>
        </div>
      </div>

      {/* {system.map((item, key) => (
          <Device device={item} enhanced={false} key={key} />
        ))}
        <CardWrapper
          title="Recent activity"
          description={`Last ${activity.count} operations`}
        >
          <HistoryList history={activity.documents} />
        </CardWrapper>
        <CardWrapper
          title="Pie Chart - Occupancy"
          description="Parking occupancy"
        >
          <OccupancyChart occupancy={occupancy} />
        </CardWrapper>
        <CardWrapper
          title="Bar Chart - Operations"
          description="Parking operations"
          className="col-span-2"
        >
          <OperationsBarChart operations={operations[0].data} />
        </CardWrapper> */}
    </div>
  );
}
