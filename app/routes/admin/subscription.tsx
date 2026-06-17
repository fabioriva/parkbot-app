import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { data, useFetcher } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
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
  updateSubscriptionByEmail,
} from "~/lib/subscription.server";
import { m } from "@paraglide/messages.js";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const action = formData.get("action");
    const email = formData.get("email");
    const company = formData.get("company");
    const role = formData.get("role");
    const aps = formData.getAll("aps");
    const subscription = {
      aps,
      company,
      email,
      role,
      subscribed: false,
    };
    if (action === "create") {
      const result = await createSubscription(subscription);
      return {
        action: m.subscription_action_create(),
        success: m.subscription_action_create_success(),
      };
    }
    if (action === "delete") {
      const result = await deleteSubscriptionByEmail(email);
      return {
        action: m.subscription_action_delete(),
        success: m.subscription_action_delete_success(),
      };
    }
    if (action === "update") {
      const result = await updateSubscriptionByEmail(email, subscription);
      return {
        action: m.subscription_action_update(),
        success: m.subscription_action_update_success(),
      };
    }
    throw new Error(m.subscription_action_error());
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

  const inactiveSubscriptions = loaderData.subscriptions.filter(
    (item) => item.subscribed === false,
  );

  const subscriptionsByCompany = loaderData.subscriptions.filter(
    (item) => item.company === company || company === "Sotefin",
  );

  return (
    <>
      <Item className="mb-3" variant="outline">
        <ItemContent>
          <ItemTitle>{m.subscriptions_title()}</ItemTitle>
          <ItemDescription className="text-xs">
            {m.subscriptions_description({
              inactives: inactiveSubscriptions.length,
              subscriptions: subscriptionsByCompany.length,
            })}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <CompanySelect
            companies={loaderData.companies}
            company={company}
            setCompany={setCompany}
          />
          <Button onClick={() => setOpen(true)} variant="outline">
            <PlusIcon /> {m.subscription_action_add()}
          </Button>
        </ItemActions>
      </Item>
      {fetcher.data?.error && (
        <ErrorAlert description={fetcher.data.error} title="Error" />
      )}
      {fetcher.data?.success && (
        <Success
          description={fetcher.data.success}
          title={fetcher.data.action}
        />
      )}
      <div className="overflow-hidden rounded-lg border">
        <SubscriptionTable
          aps={loaderData.aps}
          fetcher={fetcher}
          subscriptions={subscriptionsByCompany}
        />
      </div>
      <SubscriptionForm
        aps={loaderData.aps}
        action="create"
        fetcher={fetcher}
        open={open}
        setOpen={setOpen}
      />
    </>
  );

  // return (
  //   <Tabs defaultValue="subscriptions">
  //     <div className="flex items-center gap-3">
  //       <div className="grow">
  //         <TabsList>
  //           <TabsTrigger value="subscriptions">{m.subscriptions()}</TabsTrigger>
  //           <TabsTrigger value="inactives">
  //             Not activated
  //             <Badge variant="default">{inactiveSubscriptions.length}</Badge>
  //           </TabsTrigger>
  //         </TabsList>
  //       </div>
  //       <CompanySelect
  //         companies={loaderData.companies}
  //         company={company}
  //         setCompany={setCompany}
  //       />
  //       <Button onClick={() => setOpen(true)} variant="outline">
  //         <PlusIcon /> {m.subscription_action_add()}
  //       </Button>
  //     </div>
  //     {fetcher.data?.error && (
  //       <ErrorAlert description={fetcher.data.error} title="Error" />
  //     )}
  //     {fetcher.data?.success && (
  //       <Success
  //         description={fetcher.data.success}
  //         title={fetcher.data.action}
  //       />
  //     )}
  //     <TabsContent value="subscriptions">
  //       <div className="overflow-hidden rounded-lg border">
  //         <SubscriptionTable
  //           aps={loaderData.aps}
  //           fetcher={fetcher}
  //           subscriptions={subscriptionsByCompany}
  //         />
  //       </div>
  //     </TabsContent>
  //     <TabsContent value="inactives">
  //       <div className="overflow-hidden rounded-lg border">
  //         <SubscriptionTable
  //           aps={loaderData.aps}
  //           fetcher={fetcher}
  //           subscriptions={inactiveSubscriptions}
  //         />
  //       </div>
  //     </TabsContent>
  //     <SubscriptionForm
  //       aps={loaderData.aps}
  //       action="create"
  //       fetcher={fetcher}
  //       open={open}
  //       setOpen={setOpen}
  //     />
  //   </Tabs>
  // );
}
