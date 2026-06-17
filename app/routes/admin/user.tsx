import { data, useFetcher } from "react-router";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { Error as ErrorAlert } from "~/components/error-alert";
import { Success } from "~/components/success-alert";
import { UserTable } from "~/components/user-table";
import { auth } from "~/lib/auth.server";
import { findUsers, deleteUserByEmail } from "~/lib/user.server";
import { m } from "@paraglide/messages.js";

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
    <>
      <Item className="mb-3" variant="outline">
        <ItemContent>
          <ItemTitle>{m.users_title()}</ItemTitle>
          <ItemDescription className="text-xs">
            {m.users_description({
              count: loaderData.users.length,
            })}
          </ItemDescription>
        </ItemContent>
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
        <UserTable fetcher={fetcher} users={loaderData.users} />
      </div>
    </>
  );
}
