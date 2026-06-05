import { MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { SubscriptionForm } from "~/components/subscription-form";
import { m } from "@paraglide/messages.js";

export function SubscriptionTable({ aps, fetcher, subscriptions }) {
  const [open, setOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState();

  const handleDelete = async (subscription) => {
    fetcher.submit({ action: "delete", ...subscription }, { method: "post" });
  };
  const handleUpdate = async (subscription) => {
    // fetcher.submit({ action: "update", ...subscription }, { method: "post" });
    setOpen(true);
    setSelectedSubscription(subscription);
  };
  return (
    <>
      <SubscriptionForm
        aps={aps}
        action="update"
        fetcher={fetcher}
        open={open}
        setOpen={setOpen}
        selectedSubscription={selectedSubscription}
      />
      {subscriptions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>{m.subscription_field_company()}</TableHead>
              <TableHead>{m.subscription_field_role()}</TableHead>
              <TableHead>{m.subscription_field_subscribed()}</TableHead>
              <TableHead>{m.subscription_field_selected_aps()}</TableHead>
              <TableHead className="text-right">
                {m.subscription_field_actions()}
              </TableHead>
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
                  <TableCell>
                    [{subscription.aps.slice(0, 3).join("], [")}] ...
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-6">
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleUpdate(subscription)}
                        >
                          {m.subscription_action_update()}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(subscription)}
                          variant="destructive"
                        >
                          {m.subscription_action_delete()}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
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
}
