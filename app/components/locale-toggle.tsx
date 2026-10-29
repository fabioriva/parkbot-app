import { Languages } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  // DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { locales, getLocale, setLocale } from "@paraglide/runtime.js"

export function LocaleToggle({ label = "Language" }: { label?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={label}>
            <Languages aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="center">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {locales.map((locale) => (
            <DropdownMenuCheckboxItem
              checked={locale === getLocale()}
              onClick={() => setLocale(locale)}
              key={locale}
            >
              <span className="uppercase">{locale}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
