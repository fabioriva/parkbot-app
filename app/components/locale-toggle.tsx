import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LocaleToggleProps {
  locale: string;
  setLocale: React.Dispatch<React.SetStateAction<string>>;
}

export function LocaleToggle({ locale, setLocale }: LocaleToggleProps) {
  const { i18n } = useTranslation();
  const languages = Object.keys(i18n.store.data);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem onClick={() => setLocale(lang)} key={lang}>
            <span>{lang}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
