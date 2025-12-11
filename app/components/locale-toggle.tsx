import { useState, useEffect, useRef } from "react";
import { Form } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";

export function LocaleToggle() {
  const { i18n } = useTranslation();
  const languages = i18n.options.supportedLanguages || [];
  const [selected, setSelected] = useState<string>(i18n.language);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    // Automatically submit the form after selection
    formRef.current?.requestSubmit();
  }, [selected]);

  return (
    <Form
      ref={formRef}
      action="/action/set-locale" // Your backend endpoint
      method="POST"
    >
      {/* Hidden input to send the selected value */}
      <input type="hidden" name="locale" value={selected} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="uppercase">{i18n.language}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuLabel>Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map((lng) => (
            <DropdownMenuItem onClick={() => setSelected(lng)} key={lng}>
              <span className="uppercase">{lng}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Form>
  );
}
