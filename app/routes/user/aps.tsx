import { MoreHorizontalIcon, PlusIcon } from "lucide-react";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ApsForm } from "~/components/aps-form";
import { ApsTable } from "~/components/aps-table";
import { CompanySelect } from "~/components/company-select";
import { Success } from "~/components/success-alert";
import { createAps, findSubscribedApsList } from "~/lib/aps.server";
import { auth } from "~/lib/auth.server";

export async function action({ context, request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const company = formData.get("company");
    const country = formData.get("country");
    const flag = formData.get("flag");
    const name = formData.get("name");
    const ns = formData.get("ns");
    const notifications = formData.get("notifications");
    const parkingSpaces = formData.get("parkingSpaces");
    const result = await createAps({
      company,
      country,
      name,
      ns,
      parkingSpaces: Number(parkingSpaces),
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
  return {
    aps,
    user: session.user,
  };
}

export default function Aps({ actionData, loaderData }: Route.LoaderArgs) {
  const [company, setCompany] = useState("Sotefin");
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  useEffect(() => setSuccess(actionData?.success), [actionData?.success]);

  const handleOpen = () => {
    setOpen(true);
    setSuccess(false);
  };

  const apsByCompany = loaderData.aps.filter(
    (item) => item.company === company || company === "Sotefin",
  );

  return (
    <Tabs className="max-w-3xl" defaultValue="aps">
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
      {success && (
        <Success description="Aps successfully created" title="created!" />
      )}
      <TabsContent value="aps">
        <div className="overflow-hidden rounded-lg border">
          <ApsTable aps={apsByCompany} />
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
          <Form
            action={`/aps/${loaderData.user.aps}/user/aps`}
            method="post"
            onSubmit={() => setOpen(false)}
          >
            <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
              <ApsForm aps={loaderData.aps} />
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
