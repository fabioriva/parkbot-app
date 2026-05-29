import { MoreHorizontalIcon } from "lucide-react";
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
  // TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function ApsTable({ aps, fetcher }) {
  const handleDelete = async (aps) => {
    fetcher.submit({ action: "delete", ...aps }, { method: "post" });
  };
  const handleUpdate = async (aps) => {
    fetcher.submit({ action: "update", ...aps }, { method: "post" });
  };
  return (
    <Table>
      {/* <TableCaption>The number of active aps is {aps.length}</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Namespace</TableHead>
          <TableHead className="text-right">Notifications</TableHead>
          <TableHead className="text-right">Actions</TableHead>
          <TableHead className="text-right">Spaces</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {aps
          .sort((a, b) => a.ns.localeCompare(b.ns)) // sort alphabetically
          .map((aps) => (
            <TableRow key={aps.ns}>
              <TableCell className="font-semibold">{aps.name}</TableCell>
              <TableCell>{aps.company}</TableCell>
              <TableCell>
                {aps.country}, {aps.flag}
              </TableCell>
              <TableCell>{aps.city}</TableCell>
              <TableCell>{aps.ns}</TableCell>
              <TableCell className="text-right uppercase">
                {aps.notifications}
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
                      onClick={() => handleUpdate(aps)}
                      disabled
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(aps)}
                      variant="destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell className="text-right">{aps.parkingSpaces}</TableCell>
            </TableRow>
          ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={6}>Total parking spaces</TableCell>
          <TableCell className="text-right">
            {aps.reduce((accumulator, currentValue) => {
              return accumulator + Number(currentValue.parkingSpaces);
            }, 0)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
