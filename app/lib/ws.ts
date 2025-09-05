import { useState, useEffect, useRef } from "react";

export function useInfo(url) {
  const ws = useRef(null);
  const [comm, setComm] = useState(false);
  const [diag, setDiag] = useState(0);
  const [expired, setExpired] = useState(false);
  const [map, setMap] = useState([]);
  const [message, setMessage] = useState(undefined);
  const [operations, setOperations] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");
    const wsCurrent = ws.current;
    return () => {
      wsCurrent.close();
    };
  }, [url]);

  useEffect(() => {
    if (!ws.current) return;
    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      // console.log(e.data);
      Object.keys(message).forEach((key) => {
        if (key === "comm") {
          setComm(message[key]);
        }
        if (key === "diag") {
          setDiag(message[key]);
        }
        if (key === "expired") {
          setExpired(Boolean(message[key]));
        }
        if (key === "map") {
          setMap(message[key]);
        }
        if (key === "notification") {
          setMessage(message[key]);
        }
        if (key === "operations") {
          setOperations(message[key]);
        }
      });
      setLoading(false);
    };
  }, []);

  return { comm, diag, expired, map, message, operations, loading };
}
