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
  // TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ApsForm } from "~/components/aps-form";
import { m } from "@paraglide/messages.js";

export function ApsTable({ aps, fetcher }) {
  const [open, setOpen] = useState(false);
  const [selectedAps, setSelectedAps] = useState();

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
        fetcher={fetcher}
        open={open}
        setOpen={setOpen}
        selectedAps={selectedAps}
      />
      {/* <TableCaption>The number of active aps is {aps.length}</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead>{m.aps_field_name()}</TableHead>
          <TableHead>{m.aps_field_company()}</TableHead>
          <TableHead>{m.aps_field_country()}</TableHead>
          <TableHead>{m.aps_field_city()}</TableHead>
          <TableHead>{m.aps_field_ns()}</TableHead>
          <TableHead>{m.aps_field_parking_spaces()}</TableHead>
          <TableHead>{m.aps_field_notifications()}</TableHead>
          <TableHead className="text-right">{m.aps_field_actions()}</TableHead>
          {/* <TableHead className="text-right">
            {m.aps_field_parking_spaces()}
          </TableHead> */}
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
              <TableCell>{aps.parkingSpaces}</TableCell>
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
                    <DropdownMenuItem onClick={() => handleUpdate(aps)}>
                      {m.aps_action_update()}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(aps)}
                      variant="destructive"
                    >
                      {m.aps_action_delete()}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              {/* <TableCell className="text-right">{aps.parkingSpaces}</TableCell> */}
            </TableRow>
          ))}
      </TableBody>
      {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={7}>
            {m.aps_field_total_parking_spaces()}
          </TableCell>
          <TableCell className="text-right">
            {aps.reduce((accumulator, currentValue) => {
              return accumulator + Number(currentValue.parkingSpaces);
            }, 0)}
          </TableCell>
        </TableRow>
      </TableFooter> */}
    </Table>
  );
}
