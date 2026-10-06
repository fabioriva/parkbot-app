import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

interface CompanySelectProps {
  companies?: string[]
  company: string
  setCompany: (company: string) => void
}

export function CompanySelect({
  companies = [],
  company,
  setCompany,
}: CompanySelectProps) {
  return (
    <Select<string>
      id="company"
      name="company"
      // defaultValue="Acme" // uncontrolled
      value={company}
      onValueChange={(value) => {
        if (value !== null) setCompany(value)
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a company" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Sotefin">Sotefin</SelectItem>
        <SelectGroup>
          {companies.map((company, index) => (
            <SelectItem value={company} key={index}>
              {company}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
