import { Trash } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";

interface ExitQueueProps {}

// const Item = () => {};

export function ExitQueue({ queue }: ExitQueueProps) {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Exit queuue</CardTitle>
        <CardDescription>No waiting calls</CardDescription>
      </CardHeader>
      <CardContent>
        <Item size="sm" className="px-0 py-0.5">
          {/* <ItemMedia>m</ItemMedia> */}
          <ItemContent>
            <ItemTitle>Next</ItemTitle>
            <ItemDescription>Card 6, stall 67</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full"
              aria-label="Invite"
            >
              <Trash />
            </Button>
          </ItemActions>
        </Item>
        <Item size="sm" className="px-0 py-1">
          {/* <ItemMedia>m</ItemMedia> */}
          <ItemContent>
            <ItemTitle>2° call</ItemTitle>
            <ItemDescription>Card 123, stall 8</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full"
              aria-label="Invite"
            >
              <Trash />
            </Button>
          </ItemActions>
        </Item>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Exit car</Button>
      </CardFooter>
    </Card>
  );
}
