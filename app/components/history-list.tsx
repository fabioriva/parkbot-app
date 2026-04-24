import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { OperationsAvatar } from "~/components/operations-avatar";
import { logT } from "~/lib/translation";

export function HistoryList({ query, media = false }: any) {
  const { t } = useTranslation();
  // Infinite scroll
  const chunkSize = 25;
  const [logs, setLogs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    setLogs(query.slice(0, chunkSize));
    setHasMore(true);
  }, [query]);
  const loadMore = () => {
    const nextLength = logs.length + chunkSize;
    const nextSlice = query.slice(0, nextLength);
    setLogs(nextSlice);
    if (nextSlice.length >= query.length) setHasMore(false);
  };
  return (
    <InfiniteScroll
      dataLength={logs.length}
      next={loadMore}
      hasMore={hasMore}
      // loader={<p className="pt-6">Loading more records…</p>}
      endMessage={<p className="pt-6">All records loaded.</p>}
    >
      <ItemGroup className="gap-0">
        {logs.map((item, key) => (
          <Item className="px-0 py-1.5 gap-3" key={key}>
            {media && (
              <ItemMedia>
                <OperationsAvatar
                  device={item.device}
                  operation={item.operation}
                />
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
              <ItemDescription className="flex items-center gap-3">
                <span>{logT(item, t)}</span>
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <div className="flex flex-col text-right text-xs">
                <span>{item.date.slice(0, 10)}</span>
                <span>{item.date.slice(11, 19)}</span>
              </div>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </InfiniteScroll>
  );
}
