import { useState, useEffect, useRef } from "react";
import { Form } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";

export function LocaleToggle() {
  const { i18n } = useTranslation();
  const languages = ["it", "fr", "en"]; // Object.keys(i18n.store.data);

  const [selected, setSelected] = useState<string>(i18n.language);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    // console.log(selected);
    // Automatically submit the form after selection
    formRef.current?.requestSubmit();
  }, [selected]);

  const handleSelect = (value: string) => {
    // console.log(value);
    setSelected(value);
  };

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
        <DropdownMenuContent>
          {languages.map((lng) => (
            <DropdownMenuItem onClick={() => handleSelect(lng)} key={lng}>
              <span className="uppercase">{lng}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Form>
  );
}
