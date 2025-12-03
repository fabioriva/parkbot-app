import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
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
import { useData } from "~/hooks/use-ws";
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

const Tag = ({ item, handleEdit }: { item: Tag; handleEdit: Function }) => {
  const { t } = useTranslation();
  const { code, nr, status } = item;
  return (
    <Item className="w-72 hover:bg-muted" variant="outline" key={nr}>
      <ItemMedia
        variant="icon"
        className={status !== 0 ? "bg-blue-500/20 text-blue-500" : ""}
      >
        <TagIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          Tag {nr} {code !== "0" && `PIN ${code}`}
        </ItemTitle>
        <ItemDescription>
          {status !== 0
            ? t("aps.tags.tag-parked", { status })
            : t("aps.tags.tag-not-parked")}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
          Edit
        </Button>
      </ItemActions>
    </Item>
  );
};

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
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <InputGroup>
        <InputGroupInput
          placeholder={t("aps.tags.search-placeholder")}
          onChange={handleSearch}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          {t("aps.tags.search-results", { count: search.length })}
        </InputGroupAddon>
      </InputGroup>
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
            <DialogTitle>
              {t("aps.tags.edit-title", { nr: tag.nr })}
            </DialogTitle>
            <DialogDescription>
              {t("aps.tags.edit-description", { nr: tag.nr })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 mb-3">
            <Label htmlFor="pin">{t("aps.tags.edit-label")}</Label>
            <Input
              className="uppercase"
              minLength={3}
              maxLength={3}
              name="pin"
              value={tag.code}
              onChange={handleChange}
            />
            {error && (
              <p className="text-red-500 text-sm">{t("aps.tags.edit-error")}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("aps.cancel")}</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={() => handleConfirm(tag)} disabled={error}>
                {t("aps.confirm")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
