import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { data, useFetcher } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
        action: "Create Aps",
        success: "Aps created successfully.",
      };
    }
    if (action === "delete") {
      const result = await deleteApsByNs(ns);
      return {
        action: "Delete Aps",
        success: "Aps successfully deleted.",
      };
    }
    if (action === "update") {
      const result = await updateApsByNs(aps, ns);
      return {
        action: "Update Aps",
        success: "Aps successfully updated.",
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
  return { aps, companies };
}

export default function Aps({ loaderData }: Route.LoaderArgs) {
  const fetcher = useFetcher();

  const [company, setCompany] = useState("Sotefin");
  const [open, setOpen] = useState(false);

  // useEffect(() => {
  //   console.log("fetcher.data", fetcher.data);
  // }, [fetcher.data]);

  const apsByCompany = loaderData.aps.filter(
    (item) => item.company === company || company === "Sotefin",
  );

  return (
    <Tabs defaultValue="aps">
      <div className="flex items-center gap-3">
        <div className="grow">
          <TabsList>
            <TabsTrigger value="aps">
              Aps List<Badge variant="default">{apsByCompany.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="disabled" disabled>
              Disabled
            </TabsTrigger>
          </TabsList>
        </div>
        <CompanySelect
          companies={loaderData.companies}
          company={company}
          setCompany={setCompany}
        />
        <Button onClick={() => setOpen(true)} variant="outline">
          <PlusIcon /> New System
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
      <TabsContent value="aps">
        <div className="overflow-hidden rounded-lg border">
          <ApsTable aps={apsByCompany} fetcher={fetcher} />
        </div>
      </TabsContent>
      <TabsContent value="disabled" />
      <ApsForm
        action="create"
        fetcher={fetcher}
        open={open}
        setOpen={setOpen}
      />
    </Tabs>
  );
}
