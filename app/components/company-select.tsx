import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function CompanySelect({ companies = [], company, setCompany }) {
  return (
    <Select
      id="company"
      name="company"
      // defaultValue="Acme" // uncontrolled
      value={company}
      onValueChange={setCompany}
    >
      <SelectTrigger className="w-48">
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
  );
}
