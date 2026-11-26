import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ALL_COMPANIES } from "~/lib/aps-filter"
import { m } from "@paraglide/messages.js"

interface CompanySelectProps {
  id?: string
  allCompanies?: boolean
  companies?: string[]
  company: string
  setCompany: (company: string) => void
}

export function CompanySelect({
  id,
  allCompanies = false,
  companies = [],
  company,
  setCompany,
}: CompanySelectProps) {
  const names = [...new Set(companies)].sort((a, b) => a.localeCompare(b))
  const options = [
    allCompanies
      ? { value: ALL_COMPANIES, label: m.company_filter_all() }
      : { value: "Sotefin", label: "Sotefin" },
    ...names
      .filter(
        (name) => name !== ALL_COMPANIES && (allCompanies || name !== "Sotefin")
      )
      .map((name) => ({ value: name, label: name })),
  ]
  return (
    <Select<string>
      name="company"
      items={options}
      value={company}
      onValueChange={(value) => {
        if (value !== null) setCompany(value)
      }}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={m.company_select_placeholder()} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map(({ value, label }) => (
            <SelectItem value={value} key={value}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
