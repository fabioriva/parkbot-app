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

export const ApsList = ({ aps }) => (
  <Table>
    {/* <TableCaption>The number of active aps is {aps.length}</TableCaption> */}
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Company</TableHead>
        <TableHead>Country</TableHead>
        <TableHead>City</TableHead>
        <TableHead>Namespace</TableHead>
        <TableHead className="text-right">Actions</TableHead>
        <TableHead className="text-right">Spaces</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {aps.map((aps) => (
        <TableRow key={aps.ns}>
          <TableCell className="font-semibold">{aps.name}</TableCell>
          <TableCell>{aps.company}</TableCell>
          <TableCell>
            {aps.country}, {aps.flag}
          </TableCell>
          <TableCell>{aps.city}</TableCell>
          <TableCell>{aps.ns}</TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6">
                  <MoreHorizontalIcon />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
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
