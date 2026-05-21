import { useOutletContext } from "react-router";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { aps } from "~/lib/aps";
import { findSubscriptions } from "~/lib/subscription.server";

export async function loader({ request }: Route.LoaderArgs) {
  const subscriptions = await findSubscriptions();
  return subscriptions;
}

export default function Subscription({ loaderData }: Route.LoaderArgs) {
  const user = useOutletContext();
  if (user?.role !== "admin") return <h1>Not authorized</h1>;

  const totalSpaces = aps.reduce((accumulator, currentValue) => {
    return accumulator + Number(currentValue.parkingSpaces);
  }, 0);

  return (
    <Tabs defaultValue="aps">
      <TabsList>
        <TabsTrigger value="aps">Aps</TabsTrigger>
        <TabsTrigger value="subscription">Subscriptions</TabsTrigger>
      </TabsList>
      <TabsContent value="aps">
        <Table className="border w-6xl">
          <TableCaption>Aps list.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Namespace</TableHead>
              <TableHead className="text-right">Spaces</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aps.map((aps) => (
              <TableRow key={aps.ns}>
                <TableCell>{aps.company}</TableCell>
                <TableCell>{aps.country}</TableCell>
                <TableCell className="font-semibold">{aps.name}</TableCell>
                <TableCell>{aps.ns}</TableCell>
                <TableCell className="font-semibold text-right">
                  {aps.parkingSpaces}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>Total</TableCell>
              <TableCell className="text-right">{totalSpaces}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TabsContent>
      <TabsContent value="subscription">
        <Table className="border">
          <TableCaption>List of user subscriptions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aps</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loaderData
              .sort((a, b) => a.email.localeCompare(b.email))
              .map((user) => (
                <TableRow key={user.email}>
                  <TableCell className="font-semibold">{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="uppercase">
                    {user.subscribed.toString()}
                  </TableCell>
                  <TableCell>[{user.aps.join("], [")}]</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
}
