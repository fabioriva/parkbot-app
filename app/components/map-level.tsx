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

// export function Level({ definitions, level, view }) {
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
              <Button variant="outline">View</Button>
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
      <CardContent className="level relative" id={"l-" + level.nr}>
          {level.stalls.map((stall) => (
            <Stall
              definitions={definitions}
              stall={stall}
              view={view}
              key={stall.nr}
            />
          ))}
      </CardContent>
    </Card>
  );

  // return (
  //   <div className="w-fit">
  //     <div className="flex flex-col gap-0">
  //       <h1 className="">{level.label}</h1>
  //       <p className="text-muted-foreground text-sm">
  //         Parking slots {level.min} - {level.max}
  //       </p>
  //     </div>
  //     <div className="level relative border bg-sidebar" id={"l-" + level.nr}>
  //       {level.stalls.map((stall) => (
  //         <Stall
  //           definitions={definitions}
  //           stall={stall}
  //           view={view}
  //           key={stall.nr}
  //         />
  //       ))}
  //     </div>
  //   </div>
  // );
}
