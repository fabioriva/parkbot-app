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
  // TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ApsForm } from "~/components/aps-form";

export function ApsTable({ aps, fetcher }) {
  const [selectedAps, setSelectedAps] = useState();
  const [open, setOpen] = useState(false);

  const handleDelete = async (aps) => {
    fetcher.submit({ action: "delete", ...aps }, { method: "post" });
  };
  const handleUpdate = async (aps) => {
    // fetcher.submit({ action: "update", ...aps }, { method: "post" });
    setOpen(true);
    setSelectedAps(aps);
  };
  return (
    <Table>
      <ApsForm
        action="update"
        aps={selectedAps}
        fetcher={fetcher}
        open={open}
        setOpen={setOpen}
      />
      {/* <TableCaption>The number of active aps is {aps.length}</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Namespace</TableHead>
          <TableHead>Notifications</TableHead>
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
              <TableCell className="uppercase">
                {aps.notifications.toString()}
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
                      // disabled
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
          <TableCell colSpan={7}>Total parking spaces</TableCell>
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
