// import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { companies } from "../../utils/companies";

export function CompanySelect({ company, setCompany }) {
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
        <SelectGroup>
          {companies.map((company) => (
            <SelectItem value={company} key={company}>
              {company}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
