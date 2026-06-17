import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { data, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { ApsForm } from "~/components/aps-form";
import { ApsTable } from "~/components/aps-table";
import { CompanySelect } from "~/components/company-select";
import { Error as ErrorAlert } from "~/components/error-alert";
import { Success } from "~/components/success-alert";
import {
  createAps,
  deleteApsByNs,
  findCompaniesFromAps,
  findSubscribedApsList,
  updateApsByNs,
} from "~/lib/aps.server";
import { auth } from "~/lib/auth.server";
import { m } from "@paraglide/messages.js";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const action = formData.get("action");
    const city = formData.get("city");
    const company = formData.get("company");
    const country = formData.get("country");
    const flag = formData.get("flag");
    const name = formData.get("name");
    const notifications = formData.get("notifications");
    const ns = formData.get("ns");
    const parkingSpaces = formData.get("parkingSpaces");
    const aps = {
      city,
      company,
      country,
      flag,
      name,
      notifications: notifications ? true : false,
      ns,
      parkingSpaces: Number(parkingSpaces),
    };
    if (action === "create") {
      const result = await createAps(aps);
      return {
        action: m.aps_action_create(),
        success: m.aps_action_create_success(),
      };
    }
    if (action === "delete") {
      const result = await deleteApsByNs(ns);
      return {
        action: m.aps_action_delete(),
        success: m.aps_action_delete_success(),
      };
    }
    if (action === "update") {
      const result = await updateApsByNs(aps, ns);
      return {
        action: m.aps_action_update(),
        success: m.aps_action_update_success(),
      };
    }
    throw new Error(m.aps_action_error());
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
  return { aps, companies };
}

export default function Aps({ loaderData }: Route.LoaderArgs) {
  const fetcher = useFetcher();

  const [company, setCompany] = useState("Sotefin");
  const [open, setOpen] = useState(false);

  const apsByCompany = loaderData.aps.filter(
    (item) => item.company === company || company === "Sotefin",
  );

  return (
    <>
      <Item className="mb-3" variant="outline">
        <ItemContent>
          <ItemTitle>{m.aps_title()}</ItemTitle>
          <ItemDescription className="text-xs">
            {m.aps_description({
              aps: apsByCompany.length,
              spaces: apsByCompany.reduce((accumulator, currentValue) => {
                return accumulator + Number(currentValue.parkingSpaces);
              }, 0),
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
            <PlusIcon /> {m.aps_action_add()}
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
        <ApsTable aps={apsByCompany} fetcher={fetcher} />
      </div>
      <ApsForm
        action="create"
        fetcher={fetcher}
        open={open}
        setOpen={setOpen}
      />
    </>
  );
}
