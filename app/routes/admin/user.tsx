// import { PlusIcon } from "lucide-react";
import { data, useFetcher } from "react-router";
import { Badge } from "~/components/ui/badge";
// import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Error as ErrorAlert } from "~/components/error-alert";
import { Success } from "~/components/success-alert";
import { UserTable } from "~/components/user-table";
import { auth } from "~/lib/auth.server";
import { findUsers, deleteUserByEmail } from "~/lib/user.server";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const action = formData.get("action");
    const email = formData.get("email");
    if (action === "delete") {
      const result = await deleteUserByEmail(email);
      return {
        action: "Delete user",
        success: "User successfully deleted.",
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
  const users = await findUsers();
  return { users };
}

export default function User({ loaderData }: Route.LoaderArgs) {
  const fetcher = useFetcher();

  return (
    <Tabs defaultValue="user">
      <div className="flex items-center gap-3">
        <div className="grow">
          <TabsList>
            <TabsTrigger value="user">
              Users
              <Badge variant="default">{loaderData.users.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="disabled" disabled>
              Disabled
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      <TabsContent value="user">
        <div className="overflow-hidden rounded-lg border">
          <UserTable fetcher={fetcher} users={loaderData.users} />
        </div>
      </TabsContent>
      <TabsContent value="disabled" />
    </Tabs>
  );
}
