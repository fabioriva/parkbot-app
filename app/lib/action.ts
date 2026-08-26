import { toast } from "~/components/ui/toast"

export async function actionResponse(response) {
  // console.log(response)
  if (response.ok) {
    const now = new Date()
    const formatted =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0") +
      ":" +
      String(now.getSeconds()).padStart(2, "0")
    const { message, severity } = await response.json()
    switch (severity) {
      case "error":
        return toast.add({ type: "error", description: message })
      case "info":
        return toast.add({ type: "info", description: message })
      case "success":
        return toast.add({ type: "success", description: message })
      case "warning":
        return toast.add({ type: "warning", description: message })
      default:
        return toast.add({ title: message, description: formatted })
    }
  }
  return toast.add({ type: "error", description: "401 Unauthorized" })
}
