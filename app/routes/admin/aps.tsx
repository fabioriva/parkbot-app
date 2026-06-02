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
import { ApsForm } from "~/components/aps-form";
import { ApsTable } from "~/components/aps-table";
import { CompanySelect } from "~/components/company-select";
import { Error as ErrorAlert } from "~/components/error-alert";
import { Success } from "~/components/success-alert";
import {
  createAps,
  deleteApsByNs,
  findSubscribedApsList,
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
    if (action === "create") {
      const aps = {
        city,
        company,
        country,
        flag,
        name,
        notifications: notifications || "off",
        ns,
        parkingSpaces: Number(parkingSpaces),
      };
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
  return { aps };
}

export default function Aps({ loaderData }: Route.LoaderArgs) {
  const fetcher = useFetcher();

  const [company, setCompany] = useState("Sotefin");
  const [open, setOpen] = useState(false);

  // useEffect(() => {
  //   console.log("fetcher.data", fetcher.data);
  // }, [fetcher.data]);

  const handleOpen = () => {
    setOpen(true);
  };

  const apsByCompany = loaderData.aps.filter(
    (item) => item.company === company || company === "Sotefin",
  );

  return (
    <Tabs className="max-w-4xl" defaultValue="aps">
      <div className="flex items-center gap-3">
        <div className="grow">
          <TabsList>
            <TabsTrigger value="aps">
              Aps List<Badge variant="default">{apsByCompany.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="aps-company" disabled>
              Disabled
            </TabsTrigger>
          </TabsList>
        </div>
        <CompanySelect company={company} setCompany={setCompany} />
        <Button onClick={handleOpen} variant="outline">
          <PlusIcon /> New Aps
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
      <TabsContent value="aps-company">
        <p>Disabled</p>
      </TabsContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Aps</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <fetcher.Form method="post" onSubmit={() => setOpen(false)}>
            <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
              <ApsForm aps={loaderData.aps} />
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
