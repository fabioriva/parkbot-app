import { UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { logT } from "~/lib/translation";

export function HistoryList({ history, media = false }: any) {
  const { t } = useTranslation();
  return (
    <>
      {history.map((item, key) => (
        <Item size="xs" className="px-0 py-1.5 gap-6" key={key}>
          {media && (
            <ItemMedia>
              <Avatar size="lg">
                {item.device.id !== 0 ? (
                  <AvatarFallback className="text-xs">
                    {item.device.key}
                  </AvatarFallback>
                ) : (
                  <AvatarFallback>
                    <UserRound size={20} />
                  </AvatarFallback>
                )}
              </Avatar>
            </ItemMedia>
          )}
          <ItemContent className="gap-0.5">
            <ItemTitle className="line-clamp-1">
              {item.device.id === 0 && t("history.log.operator")}
              {item.device.id !== 0 && !media && item.device.key}
              {item.device.id !== 0 && (
                <span className="Capitalize">
                  {" "}
                  {t("mode." + item.mode.key)}
                </span>
              )}
            </ItemTitle>
            <ItemDescription>{logT(item, t)}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <div className="flex flex-col text-right">
              <span>{item.date.slice(0, 10)}</span>
              <span>{item.date.slice(11, 19)}</span>
            </div>
          </ItemActions>
        </Item>
      ))}
    </>
  );
}
