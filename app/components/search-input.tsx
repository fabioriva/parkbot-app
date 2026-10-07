import { Search } from "lucide-react"
import type { ChangeEvent } from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group"

interface SearchInputProps {
  search: readonly unknown[]
  placeholder: string
  handleSearch: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>
}

export function SearchInput({
  search,
  placeholder,
  handleSearch,
}: SearchInputProps) {
  return (
    <InputGroup>
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
  )
}
