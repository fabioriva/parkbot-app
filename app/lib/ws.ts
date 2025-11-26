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
  const [comm, setComm] = useState(false);
  const [diag, setDiag] = useState(0);
  // const [expired, setExpired] = useState(false);
  const [map, setMap] = useState([]);
  // const [message, setMessage] = useState(undefined);
  const [operations, setOperations] = useState(undefined);
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
        if (key === "comm") {
          setComm(message[key]);
        }
        if (key === "diag") {
          setDiag(message[key]);
        }
        // if (key === "expired") {
        //   setExpired(Boolean(message[key]));
        // }
        if (key === "map") {
          setMap(message[key]);
        }
        if (key === "notification") {
          // console.log(message[key])
          // setMessage(message[key]);
          toast(getTranslation(message[key], t), {
            description: "Date " + message[key].date,
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
            // style: {
            //   background: "red",
            // },
          })
        }
        if (key === "operations") {
          setOperations(message[key]);
        }
      });
      setLoading(false);
    };
  }, []);

  return { comm, diag, /*expired,*/ map, /*message,*/ operations, loading };
}
