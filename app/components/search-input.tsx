import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";

export function SearchInput({ search, placeholder, handleSearch }) {
  return (
    <InputGroup className="w-full lg:max-w-sm">
      <InputGroupInput
        placeholder={placeholder}
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
