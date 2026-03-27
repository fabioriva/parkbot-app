import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";

export function SearchInput({ search, handleSearch }) {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupInput
        placeholder="Search by number, pin..."
        onChange={(e) => handleSearch(e)}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        {search.length} results
      </InputGroupAddon>
    </InputGroup>
  );
}
