import { EyeIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Stall } from "~/components/map-stall";

export function Level({ definitions, level }) {
  const [view, setView] = useState("view2");

  return (
    <Card className="w-fit" size="sm">
      <CardHeader>
        <CardTitle>{level.label}</CardTitle>
        <CardDescription>
          Parking slots {level.min} - {level.max}
        </CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <EyeIcon /> View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Select a view</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={view} onValueChange={setView}>
                  <DropdownMenuRadioItem value="view0">
                    Icons
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="view3">
                    Sizes
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="view2">
                    Slots
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="view1">
                    Tags
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="level relative" id={"l-" + level.nr}>
          {level?.elevators !== undefined &&
            level.elevators.map((el, i) => (
              <div
                className="absolute h-[30px] w-[40px] leading-[30px] bg-muted text-center text-sm el"
                id={el.id}
                key={i}
              >
                {el.label}
              </div>
            ))}
          {level.stalls.map((stall) => (
            <Stall
              definitions={definitions}
              stall={stall}
              view={view}
              key={stall.nr}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
