import { data } from "react-router";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ApsForm } from "~/components/aps-form";
import {
  // createAps,
  findSubscribedApsList,
} from "~/lib/aps.server";
import { auth } from "~/lib/auth.server";

export async function action({ context, request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    console.log(formData);

    const company = formData.get("company");
    const country = formData.get("country");
    const flag = formData.get("flag");
    const name = formData.get("name");
    const ns = formData.get("ns");
    const notifications = formData.get("notifications");
    const parkingSpaces = formData.get("parkingSpaces");
    // const result = await createAps({
    //   company,
    //   country,
    //   name,
    //   ns,
    //   parkingSpaces: Number(parkingSpaces),
    // });

    // console.log(result);
    if (result?.acknowledged) {
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    }
  } catch (error) {
    console.log(error);
    // return { error: error?.body?.message };
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: await request.headers,
  });
  if (!session) {
    return redirect("/signin");
  }
  if (session.user.role !== "admin") {
    throw data("Forbidden", { status: 403 });
  }
  const aps = await findSubscribedApsList([]);
  return {
    aps,
    user: session.user,
  };
}

export default function Subscription({ loaderData }: Route.LoaderArgs) {
  const totalSpaces = loaderData.aps.reduce((accumulator, currentValue) => {
    return accumulator + Number(currentValue.parkingSpaces);
  }, 0);

  return (
    <Tabs defaultValue="aps">
      <TabsList className="mb-3">
        <TabsTrigger value="aps">Aps List</TabsTrigger>
        <TabsTrigger value="aps-form">Add Aps</TabsTrigger>
      </TabsList>
      <TabsContent value="aps">
        <div className="w-6xl overflow-x-auto">
          <Table className="border">
            <TableCaption>
              The number of active aps is {loaderData.aps.length}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead className="text-right">Spaces</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loaderData.aps.map((aps) => (
                <TableRow key={aps.ns}>
                  <TableCell className="font-semibold">{aps.name}</TableCell>
                  <TableCell>{aps.company}</TableCell>
                  <TableCell>
                    {aps.country}, {aps.flag}
                  </TableCell>
                  <TableCell>{aps.city}</TableCell>
                  <TableCell>{aps.ns}</TableCell>
                  <TableCell className="font-semibold text-right">
                    {aps.parkingSpaces}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>Total parking spaces</TableCell>
                <TableCell className="text-right">{totalSpaces}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </TabsContent>
      <TabsContent value="aps-form">
        <ApsForm user={loaderData.user} />
      </TabsContent>
    </Tabs>
  );
}
