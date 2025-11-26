import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getTranslation } from "~/lib/translation";
import { toast } from "sonner";

export function useData(url: string, options: any) {
  const { initialData } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");
    return () => {
      ws.current.close();
    };
  }, [url]);

  useEffect(() => {
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
  const [info, setInfo] = useState({
    comm: false,
    diag: 0,
    map: [
      { id: "busy", value: 0 },
      { id: "free", value: 0 },
      { id: "lock", value: 0 },
    ],
    // operations: {}
  });
  const [loading, setLoading] = useState(true);

  const ws = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");
    return () => {
      ws.current.close();
    };
  }, [url]);

  useEffect(() => {
    if (!ws.current) return;
    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      Object.keys(message).forEach((key) => {
        if (key === "notification") {
          // console.log(message[key])
          toast(getTranslation(message[key], t), {
            description: "Date " + message[key].date,
            // action: {
            //   label: "Undo",
            //   onClick: () => console.log("Undo"),
            // },
            // style: {
            //   background: "red",
            // },
          });
        } else {
          // console.log(e.data);
          setInfo(message);
        }
      });
      setLoading(false);
    };
  }, []);

  return { info, loading };
}
