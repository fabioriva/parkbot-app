import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { handleNotificationRequest } from "~/lib/notifications-endpoint.server"

export function action({ request }: ActionFunctionArgs) {
  return handleNotificationRequest(request)
}

export function loader({ request }: LoaderFunctionArgs) {
  return handleNotificationRequest(request)
}
