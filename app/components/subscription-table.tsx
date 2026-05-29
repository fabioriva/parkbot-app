import { MoreHorizontalIcon } from "lucide-react";
import { useFetcher } from "react-router";
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

export function SubscriptionTable({ fetcher, subscriptions }) {
  const handleDelete = async (subscription) => {
    fetcher.submit({ action: "delete", ...subscription }, { method: "post" });
  };
  const handleUpdate = async (subscription) => {
    fetcher.submit({ action: "update", ...subscription }, { method: "post" });
  };
  return (
    <>
      {subscriptions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aps</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                  {/* <TableCell>[{subscription.aps.join("], [")}]</TableCell> */}
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
                          disabled
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(subscription)}
                          variant="destructive"
                        >
                          Delete
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
