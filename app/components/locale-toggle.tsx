// import { useState, useEffect, useRef } from "react";
// import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
// import { Input } from "~/components/ui/input";
import { locales, getLocale, setLocale } from "@paraglide/runtime.js";

export function LocaleToggle() {
  // const { i18n } = useTranslation();
  // const languages = i18n.options.supportedLanguages || [];
  // const [selected, setSelected] = useState<string>(i18n.language);
  // const formRef = useRef<HTMLFormElement>(null);
  // useEffect(() => {
  //   // Automatically submit the form after selection
  //   formRef.current?.requestSubmit();
  // }, [selected]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="uppercase">{getLocale()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((lng) => (
          <DropdownMenuItem onClick={() => setLocale(lng)} key={lng}>
            <span className="uppercase">{lng}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
