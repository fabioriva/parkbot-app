import { data } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { SubscriptionForm } from "~/components/subscription-form";
// import { aps } from "~/lib/aps";
import { findSubscribedApsList } from "~/lib/aps.server";
import { auth } from "~/lib/auth.server";
import {
  createSubscription,
  findSubscriptions,
} from "~/lib/subscription.server";

export async function action({ context, request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
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
  const aps = await findSubscribedApsList([]);
  const subscriptions = await findSubscriptions();
  return {
    aps,
    subscriptions,
    user: session.user,
  };
}

export default function Subscription({ loaderData }: Route.LoaderArgs) {
  const totalSpaces = loaderData.aps.reduce((accumulator, currentValue) => {
    return accumulator + Number(currentValue.parkingSpaces);
  }, 0);

  return (
    <Tabs defaultValue="subscription">
      <TabsList className="mb-3">
        <TabsTrigger value="subscription">Subscription List</TabsTrigger>
        <TabsTrigger value="subscription-form">Add Subscription</TabsTrigger>
      </TabsList>
      <TabsContent value="subscription">
        <div className="w-6xl">
          <Table className="border">
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
      </TabsContent>
      <TabsContent value="subscription-form">
        <SubscriptionForm aps={loaderData.aps} user={loaderData.user} />
      </TabsContent>
    </Tabs>
  );
}
