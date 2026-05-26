import { PlusIcon, TableIcon } from "lucide-react";
import { useState, useEffect } from "react";
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
import { Success } from "~/components/success-alert";
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
    const aps = formData.getAll("aps");
    const result = await createSubscription({
      aps,
      email,
      role,
      subscribed: false,
    });
    if (result?.acknowledged) {
      // console.log(`A document was inserted with the _id: ${result.insertedId}`);
      return { success: true };
    }
  } catch (error) {
    console.log(error);
    return { message: error?.body?.message };
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

export default function Subscription({
  actionData,
  loaderData,
}: Route.LoaderArgs) {
  const [success, setSuccess] = useState(false);
  useEffect(() => setSuccess(actionData?.success), [actionData?.success]);

  return (
    <Tabs defaultValue="subscription">
      <TabsList>
        <TabsTrigger value="subscription">
          <TableIcon />
          Subscriptions
        </TabsTrigger>
        <TabsTrigger value="subscription-form">
          <PlusIcon />
          Add
        </TabsTrigger>
      </TabsList>
      <TabsContent value="subscription">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableCaption>
              The number of active subscriptions is{" "}
              {loaderData.subscriptions.length}
            </TableCaption>
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
        {success && (
          <Success
            description="Subscription successfully created"
            title="created!"
          />
        )}
        <SubscriptionForm aps={loaderData.aps} user={loaderData.user} />
      </TabsContent>
    </Tabs>
  );
}
