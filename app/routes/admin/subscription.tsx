import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { data, useFetcher } from "react-router";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CompanySelect } from "~/components/company-select";
import { Error as ErrorAlert } from "~/components/error-alert";
import { SubscriptionForm } from "~/components/subscription-form";
import { SubscriptionTable } from "~/components/subscription-table";
import { Success } from "~/components/success-alert";
// import { aps } from "~/lib/aps";
import { findCompaniesFromAps, findSubscribedApsList } from "~/lib/aps.server";
import { auth } from "~/lib/auth.server";
import {
  createSubscription,
  deleteSubscriptionByEmail,
  findSubscriptions,
} from "~/lib/subscription.server";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const action = formData.get("action");
    const email = formData.get("email");
    const company = formData.get("company");
    const role = formData.get("role");
    const aps = formData.getAll("aps");
    if (action === "create") {
      const subscription = {
        aps,
        company,
        email,
        role,
        subscribed: false,
      };
      const result = await createSubscription(subscription);
      return {
        action: "Create subscription",
        success: "Subscription created successfully.",
      };
    }
    if (action === "delete") {
      const result = await deleteSubscriptionByEmail(email);
      return {
        action: "Delete subscription",
        success: "Subscription successfully deleted.",
      };
    }
    throw new Error("Non-existent action error.");
  } catch (error) {
    // console.log(error);
    return { error: error?.message };
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
  const companies = await findCompaniesFromAps(aps);
  const subscriptions = await findSubscriptions();
  return { aps, companies, subscriptions };
}

export default function Subscription({ loaderData }: Route.LoaderArgs) {
  const fetcher = useFetcher();

  const [company, setCompany] = useState("Sotefin");
  const [open, setOpen] = useState(false);

  // useEffect(() => {
  //   console.log("fetcher.data", fetcher.data);
  // }, [fetcher.data]);

  const inactiveSubscriptions = loaderData.subscriptions.filter(
    (item) => item.subscribed === false,
  );

  const subscriptionsByCompany = loaderData.subscriptions.filter(
    (item) => item.company === company || company === "Sotefin",
  );

  return (
    <Tabs defaultValue="subscriptions">
      <div className="flex items-center gap-3">
        <div className="grow">
          <TabsList>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="inactives">
              Not activated
              <Badge variant="default">{inactiveSubscriptions.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        <CompanySelect
          companies={loaderData.companies}
          company={company}
          setCompany={setCompany}
        />
        <Button onClick={() => setOpen(true)} variant="outline">
          <PlusIcon /> New Subscription
        </Button>
      </div>
      {fetcher.data?.error && (
        <ErrorAlert description={fetcher.data.error} title="Error" />
      )}
      {fetcher.data?.success && (
        <Success
          description={fetcher.data.success}
          title={fetcher.data.action}
        />
      )}
      <TabsContent value="subscriptions">
        <div className="overflow-hidden rounded-lg border">
          <SubscriptionTable
            fetcher={fetcher}
            subscriptions={subscriptionsByCompany}
          />
        </div>
      </TabsContent>
      <TabsContent value="inactives">
        <div className="overflow-hidden rounded-lg border">
          <SubscriptionTable
            fetcher={fetcher}
            subscriptions={inactiveSubscriptions}
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
          <fetcher.Form method="post" onSubmit={() => setOpen(false)}>
            <input name="action" value="create" type="hidden" />
            <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
              <SubscriptionForm
                aps={loaderData.aps}
                // companies={loaderData.companies}
                company={company}
                setCompany={setCompany}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
              {fetcher.state !== "idle" && <p>Saving...</p>}
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
