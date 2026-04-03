import { useTranslation } from "react-i18next";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { OperationsAvatar } from "~/components/operations-avatar";
import { logT } from "~/lib/translation";

export function HistoryList({ query, media = false }: any) {
  const { t } = useTranslation();
  return (
    <>
      {query.map((item, key) => (
        <Item size="xs" className="px-0 py-1.5 gap-6" key={key}>
          {media && (
            <ItemMedia>
              <OperationsAvatar device={item.device} operation={item.operation} />
            </ItemMedia>
          )}
          <ItemContent className="gap-0.5">
            <ItemTitle className="line-clamp-1">
              {item.device.id === 0 && t("history.log.operator")}
              {item.device.id !== 0 && item.device.key}
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
