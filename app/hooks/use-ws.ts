import * as React from "react"
import { toast } from "~/components/ui/toast"
import { logT } from "~/lib/trans"
import { formatPlantDateTime } from "~/lib/date-time"

interface WebSocketHandlers {
  onMessage: (event: MessageEvent<string>) => void
  onOpen?: () => void
  onClose?: (event: CloseEvent) => void
}

export function connectReconnectingWebSocket(
  url: string,
  handlers: WebSocketHandlers
): () => void {
  let disposed = false
  let socket: WebSocket | undefined
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let retryDelay = 1_000

  const connect = () => {
    if (disposed) return

    const current = new WebSocket(url)
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
  const handler = React.useRef(onMessage)
  const [connected, setConnected] = React.useState(false)

  React.useEffect(() => {
    handler.current = onMessage
  }, [onMessage])

  React.useEffect(() => {
    setConnected(false)
    return connectReconnectingWebSocket(url, {
      onMessage: (event) => handler.current(event),
      onOpen: () => setConnected(true),
      onClose: () => setConnected(false),
    })
  }, [url])

  return connected
}

export function useData<T>(url: string, options: { initialData: T }) {
  const { initialData } = options
  const [data, setData] = React.useState(initialData)
  const [loading, setLoading] = React.useState(true)
  const connected = useReconnectingWebSocket(url, (event) => {
    const message: T = JSON.parse(event.data)
    setData(message)
    setLoading(false)
  })

  return { data, loading, connected }
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

  const connected = useReconnectingWebSocket(url, (event) => {
    const message = JSON.parse(event.data)
    Object.keys(message).forEach((key) => {
      if (key === "notification") {
        toast.add({
          title: logT(message[key]),
          description: timeZone
            ? formatPlantDateTime(
                message[key].date,
                timeZone,
                "dd/MM/yyyy HH:mm:ss xxx"
              )
            : "—",
        })
      } else {
        setInfo(message)
      }
    })
    setLoading(false)
  })

  return { info, loading, connected }
}
