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
import { SubscriptionForm } from "~/components/subscription-form";
import { aps } from "~/lib/aps";
import { auth } from "~/lib/auth.server";
import {
  createSubscription,
  findSubscriptions,
} from "~/lib/subscription.server";

export async function action({ context, request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    // console.log(formData);
    const email = formData.get("email");
    const role = formData.get("role");
    const selectedAps = formData.getAll("aps");
    const result = await createSubscription({
      aps: selectedAps,
      email,
      role,
      subscribed: false,
    });
    console.log(result);

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
  const subscriptions = await findSubscriptions();
  // return subscriptions;
  return {
    subscriptions,
    user: session.user,
  };
}

export default function Subscription({ loaderData }: Route.LoaderArgs) {
  const totalSpaces = aps.reduce((accumulator, currentValue) => {
    return accumulator + Number(currentValue.parkingSpaces);
  }, 0);

  return (
    <Tabs defaultValue="aps">
      <TabsList>
        <TabsTrigger value="aps">Aps</TabsTrigger>
        <TabsTrigger value="subscription">Subscriptions</TabsTrigger>
      </TabsList>
      <TabsContent value="aps">
        <div className="w-6xl overflow-x-auto">
          <Table className="border min-w-6xl">
            <TableCaption>Aps list.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead className="text-right">Spaces</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aps.map((aps) => (
                <TableRow key={aps.ns}>
                  <TableCell>{aps.company}</TableCell>
                  <TableCell>{aps.country}</TableCell>
                  <TableCell className="font-semibold">{aps.name}</TableCell>
                  <TableCell>{aps.ns}</TableCell>
                  <TableCell className="font-semibold text-right">
                    {aps.parkingSpaces}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>Total</TableCell>
                <TableCell className="text-right">{totalSpaces}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </TabsContent>
      <TabsContent className="space-y-6" value="subscription">
        <div className="w-6xl">
          <Table className="border min-w-6xl">
            <TableCaption>List of user subscriptions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loaderData.subscriptions
                .sort((a, b) => a.email.localeCompare(b.email)) // sort alphabetically
                .map((user) => (
                  <TableRow key={user.email}>
                    <TableCell className="font-semibold">
                      {user.email}
                    </TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="uppercase">
                      {user.subscribed.toString()}
                    </TableCell>
                    <TableCell>[{user.aps.join("], [")}]</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <SubscriptionForm aps={aps} user={loaderData.user} />
      </TabsContent>
    </Tabs>
  );
}
