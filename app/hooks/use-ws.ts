import * as React from "react";
// import { useTranslation } from "react-i18next";
import { logT } from "~/lib/trans";
import { toast } from "sonner";

export function useData(url: string, options: any) {
  const { initialData } = options;
  const [data, setData] = React.useState(initialData);
  const [loading, setLoading] = React.useState(true);
  const ws = React.useRef(null);

  React.useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");
    return () => {
      ws.current.close();
    };
  }, [url]);

  React.useEffect(() => {
    if (!ws.current) return;
    ws.current.onerror = (e) => console.error(e);
    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      setData(message);
      setLoading(false);
    };
  }, []);

  return { data, loading };
}

export function useInfo(url: string) {
  const [info, setInfo] = React.useState({
    comm: false,
    diag: 0,
    map: [
      { id: "busy", value: 0 },
      { id: "free", value: 0 },
      { id: "lock", value: 0 },
    ],
    // operations: {}
  });
  const [loading, setLoading] = React.useState(true);

  const ws = React.useRef(null);
  // const { t } = useTranslation();

  React.useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");
    return () => {
      ws.current.close();
    };
  }, [url]);

  React.useEffect(() => {
    if (!ws.current) return;
    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      Object.keys(message).forEach((key) => {
        if (key === "notification") {
          toast(logT(message[key]), {
            description: message[key].date.slice(0, -1).split("T").join(" "),
          });
        } else {
          setInfo(message);
        }
      });
      setLoading(false);
    };
  }, []);

  return { info, loading };
}
