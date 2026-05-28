import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export const SubscriptionTable = ({ subscriptions }) => (
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
                <TableCell>[{subscription.aps.join("], [")}]</TableCell>
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
