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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function UserTable({ fetcher, users }) {
  const handleDelete = async (user) => {
    fetcher.submit({ action: "delete", ...user }, { method: "post" });
  };
  const handleUpdate = async (user) => {
    fetcher.submit({ action: "update", ...user }, { method: "post" });
  };
  return (
    <>
      {users.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Email verified</TableHead>
              <TableHead>2FA enabled</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Aps</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users
              // .sort((a, b) => a.email.localeCompare(b.email)) // sort alphabetically
              .map((user) => (
                <TableRow key={user.email}>
                  <TableCell className="capitalize">{user.name}</TableCell>
                  <TableCell className="font-semibold">{user.email}</TableCell>
                  <TableCell className="uppercase">
                    {user.emailVerified.toString()}
                  </TableCell>
                  <TableCell className="uppercase">
                    {user.twoFactorEnabled.toString()}
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.aps}</TableCell>
                  <TableCell>
                    {user.createdAt.toISOString()}
                    {/* {user.createdAt.toLocaleString("it-IT")} */}
                  </TableCell>
                  <TableCell>
                    {user.updatedAt.toISOString()}
                    {/* {user.updatedAt.toLocaleString("it-IT")} */}
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
                          onClick={() => handleUpdate(use)}
                          disabled
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(user)}
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
          No users found.
        </div>
      )}
    </>
  );
}
