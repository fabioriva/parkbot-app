interface HistoryItem {
  name: string;
  entries: number;
  exits: number;
  total: number;
}

interface HistoryListProps {
  operations: OperationsItem[];
}

export function HistoryList({ history }: HistoryListProps) {
  return (
    <div className="grid gap-3">
      {history.map((item, key) => (
        <div className="flex items-center justify-between text-sm" key={key}>
          <div className="flex items-center gap-4">
            <span className="bg-indigo-100 border-indigo-600 text-indigo-600 font-semibold py-1 rounded-sm text-center w-12">
              {item.device.key}
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="leading-none font-medium">{item.mode.key}</p>
              <p className="text-muted-foreground text-xs">
                {item.operation.key}
              </p>
            </div>
          </div>
          <div className="flex flex-col text-right text-xs">
            <p>{item.date.slice(0, 10)}</p>
            <p>{item.date.slice(11, 19)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
