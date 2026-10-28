import * as React from "react"
import { toast } from "~/components/ui/toast"
import { logT } from "~/lib/trans"
import { formatPlantDateTime } from "~/lib/date-time"

export const WebSocketAuthContext = React.createContext<string | undefined>(
  undefined
)

interface WebSocketHandlers {
  onMessage: (event: MessageEvent<string>) => void
  onOpen?: () => void
  onClose?: (event: CloseEvent) => void
}

export function connectReconnectingWebSocket(
  url: string,
  handlers: WebSocketHandlers,
  token?: string
): () => void {
  let disposed = false
  let socket: WebSocket | undefined
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let retryDelay = 1_000

  const connect = () => {
    if (disposed) return

    const current = token
      ? new WebSocket(url, ["parkbot", `parkbot-session.${token}`])
      : new WebSocket(url)
    socket = current
    const isActive = () => !disposed && socket === current

    current.onopen = () => {
      if (!isActive()) return
      retryDelay = 1_000
      handlers.onOpen?.()
    }

    current.onmessage = (event: MessageEvent<string>) => {
      if (isActive()) handlers.onMessage(event)
    }

    current.onerror = () => {
      if (isActive()) console.warn("WebSocket error", { url })
      // Retry on close so an error and its close event do not start two retries.
    }

    current.onclose = (event) => {
      if (!isActive()) return

      handlers.onClose?.(event)
      console.warn("WebSocket closed", {
        url,
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      })

      // Policy violations need explicit handling rather than automatic retries.
      if (event.code === 1008) return

      const delay = retryDelay * (0.8 + Math.random() * 0.2)
      retryDelay = Math.min(retryDelay * 2, 30_000)
      retryTimer = setTimeout(connect, delay)
    }
  }

  connect()

  return () => {
    disposed = true
    clearTimeout(retryTimer)
    const current = socket
    socket = undefined
    current?.close()
  }
}

function useReconnectingWebSocket(
  url: string,
  onMessage: (event: MessageEvent<string>) => void
) {
  const token = React.useContext(WebSocketAuthContext)
  const handler = React.useRef(onMessage)
  const [connectionState, setConnectionState] = React.useState<
    "connecting" | "open" | "closed"
  >("connecting")

  React.useEffect(() => {
    handler.current = onMessage
  }, [onMessage])

  React.useEffect(() => {
    setConnectionState("connecting")
    return connectReconnectingWebSocket(
      url,
      {
        onMessage: (event) => handler.current(event),
        onOpen: () => setConnectionState("open"),
        onClose: () => setConnectionState("closed"),
      },
      token
    )
  }, [url, token])

  return connectionState
}

export function useInfo(url: string, timeZone: string | null) {
  const [info, setInfo] = React.useState({
    comm: false,
    diag: 0,
    map: [
      { id: "busy", value: 0 },
      { id: "free", value: 0 },
      { id: "lock", value: 0 },
    ],
    // operations: {}
  })
  const [loading, setLoading] = React.useState(true)

  const connectionState = useReconnectingWebSocket(url, (event) => {
    const message = JSON.parse(event.data)
    if (message.notification) {
      toast.add({
        title: logT(message.notification),
        description: timeZone
          ? formatPlantDateTime(
              message.notification.date,
              timeZone,
              "dd/MM/yyyy HH:mm:ss xxx"
            )
          : "—",
      })
    }
    // A notification alone does not confirm the current PLC state.
    if (typeof message.comm === "boolean") {
      setInfo(message)
      setLoading(false)
    }
  })

  React.useEffect(() => {
    if (connectionState !== "open") setLoading(true)
  }, [connectionState, url])

  return {
    info,
    loading,
    connected: connectionState === "open",
    connectionState,
  }
}
