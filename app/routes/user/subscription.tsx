import { PlusIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { data, Form } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { CompanySelect } from "~/components/company-select";
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
    const company = formData.get("company");
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

const SubscriptionList = ({ subscriptions }) => (
  <>
    {subscriptions.length > 0 ? (
      <Table>
        <TableCaption>
          The number of active subscriptions is {subscriptions.length}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aps</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions
            .sort((a, b) => a.email.localeCompare(b.email)) // sort alphabetically
            .map((subscription) => (
              <TableRow key={subscription.email}>
                <TableCell className="font-semibold">
                  {subscription.email}
                </TableCell>
                <TableCell>{subscription.company}</TableCell>
                <TableCell>{subscription.role}</TableCell>
                <TableCell className="uppercase">
                  {subscription.subscribed.toString()}
                </TableCell>
                <TableCell>[{subscription.aps.join("], [")}]</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    ) : (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No subscriptions found.
      </div>
    )}
  </>
);

export default function Subscription({
  actionData,
  loaderData,
}: Route.LoaderArgs) {
  const [company, setCompany] = useState("Sotefin");
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  useEffect(() => setSuccess(actionData?.success), [actionData?.success]);

  const handleOpen = () => {
    setOpen(true);
    setSuccess(false);
  };

  return (
    <Tabs className="max-w-3xl" defaultValue="subscriptions">
      <div className="flex items-center gap-3">
        <div className="grow mb-3">
          <TabsList>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="inactives">
              Not activated
              <Badge variant="default">{loaderData.subscriptions.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        <CompanySelect company={company} setCompany={setCompany} />
        <Button onClick={handleOpen} variant="outline">
          <PlusIcon /> New Subscription
        </Button>
      </div>
      <TabsContent value="subscriptions">
        {success && (
          <Success
            description="Subscription successfully created"
            title="created!"
          />
        )}
        <div className="overflow-hidden rounded-lg border">
          <SubscriptionList
            subscriptions={loaderData.subscriptions.filter(
              (item) => item.company === company || company === "Sotefin",
            )}
          />
        </div>
      </TabsContent>
      <TabsContent value="inactives">
        {success && (
          <Success
            description="Subscription successfully created"
            title="created!"
          />
        )}
        {/* <SubscriptionForm aps={loaderData.aps} user={loaderData.user} /> */}
        <div className="overflow-hidden rounded-lg border">
          <SubscriptionList
            subscriptions={loaderData.subscriptions.filter(
              (item) => item.subscribed === false,
            )}
          />
        </div>
      </TabsContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <Form
            action={`/aps/${loaderData.user.aps}/user/subscription`}
            method="post"
            onSubmit={() => setOpen(false)}
          >
            <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
              <SubscriptionForm aps={loaderData.aps} user={loaderData.user} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
