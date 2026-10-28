import { AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { m } from "@paraglide/messages.js"

interface NoDataAlertProps {
  title?: string
  description?: string
}

export function NoDataAlert({
  title = m.no_data_alert_title(),
  description = m.no_data_alert_description(),
}: NoDataAlertProps = {}) {
  return (
    <Alert variant="destructive" className="max-w-md gap-y-1.5 p-4">
      <AlertCircleIcon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
