import React, { useState } from "react";
// import Fuse from "fuse.js";
import { Search, Tag as TagIcon } from "lucide-react";
import { z } from "zod";
import { Error } from "~/components/error";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { Label } from "~/components/ui/label";
import { getSessionCookie } from "~/lib/session.server";
import { useData } from "~/lib/ws";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/tags";
import type { Tag } from "~/routes/aps/types";

export async function loader({ params, request }: Route.LoaderArgs) {
  // console.log(params);
  const { token } = await getSessionCookie(request);
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/cards`;
  const data = await fetcher(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return { data, token };
}

const Tag = ({ item, handleEdit }: { item: Tag; handleEdit: Function }) => (
  <Item className="w-80" variant="outline" key={item.nr}>
    <ItemMedia
      variant="icon"
      className={item.status !== 0 ? "bg-blue-700/20 text-blue-700" : ""}
    >
      <TagIcon />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>
        Tag {item.nr} {item.code !== "0" && `PIN ${item.code}`}
      </ItemTitle>
      <ItemDescription>
        {item.status !== 0 ? `Parked in slot ${item.status}` : "Valid fo entry"}
      </ItemDescription>
    </ItemContent>
    <ItemActions>
      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
        Edit
      </Button>
    </ItemActions>
  </Item>
);

export default function Tags({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData?.data) return <Error />;
  // ws
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/cards`;
  const { data } = useData(url, { initialData: loaderData?.data });
  // fuzzy search
  const [search, setSearch] = useState<Tag[]>([]);
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const Fuse = (await import("fuse.js")).default;
    const fuse = new Fuse(data, {
      keys: ["code", "nr", "type", "uid"],
    });
    const result = fuse.search(e.target.value);
    setSearch(result);
  };
  // pin
  const [error, setError] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [tag, setTag] = useState<Tag>({
    nr: 0,
    code: "000",
    from: "",
    to: "",
    status: 0,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const schema = z.coerce
      .string()
      .length(3)
      .regex(/^[a-fA-F0-9]{3}$/);
    const result = schema.safeParse(e.target.value);
    if (!result.success) {
      setError(true);
    } else {
      setError(false);
    }
    setTag((prev: Tag) => ({ ...prev, code: e.target.value }));

    // let value = e.target.value;
    // const regexp = /^[a-fA-F0-9]{3}$/;
    // if (!regexp.test(value) || value.length !== 3) {
    //   setError(true);
    // } else {
    //   setError(false);
    // }
    // setTag((prev: Tag) => ({ ...prev, code: value }));
  };
  const handleConfirm = async ({ nr, code }: { nr: number; code: string }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/card/edit`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + loaderData?.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nr, code }),
    });
    // console.log(res);
  };
  const handleEdit = (tag: Tag) => {
    setOpen(true);
    setTag(tag);
    // if (user.rights.some((right) => right === "edit-card")) {
    //   setIsOpenPin(true);
    // }
  };

  return (
    <React.Fragment>
      <div className="relative">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <Search className="size-4" />
        </div>
        <Input
          type="text"
          placeholder="Search tag by number or PIN ..."
          className="pl-9"
          onChange={handleSearch}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        {search.length === 0 &&
          data.map((item: Tag) => (
            <Tag handleEdit={handleEdit} item={item} key={item.nr} />
          ))}
        {search.length > 0 &&
          search.map(({ item }) => (
            <Tag handleEdit={handleEdit} item={item} key={item.nr} />
          ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit card {tag.nr} status</DialogTitle>
            <DialogDescription>
              Edit card {tag.nr} PIN code and confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 mb-3">
            <Label htmlFor="pin">
              Card number range [{"min"}-{"max"}]
            </Label>
            <Input
              className="uppercase"
              // min={min}
              // max={max}
              maxLength={3}
              name="pin"
              // type="number"
              value={tag.code}
              onChange={handleChange}
            />
            {error && (
              <p className="text-red-500 text-sm">PIN code is not valid!</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={() => handleConfirm(tag)} disabled={error}>
                Confirm
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
