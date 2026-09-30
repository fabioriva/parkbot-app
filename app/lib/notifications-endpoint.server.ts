import { MailService } from "@sendgrid/mail"
import { authenticateNotificationRequest } from "./notifications-auth.server"
import { createNotificationsHandler } from "./notifications.server"

const mailer = new MailService()
mailer.setTimeout(10_000)

export const handleNotificationRequest = createNotificationsHandler({
  authenticate: authenticateNotificationRequest,
  async sendEmail(email) {
    const apiKey = process.env.SENDGRID_API_KEY
    const from = process.env.SENDGRID_SENDER
    if (!apiKey || !from) {
      throw new Error("SENDGRID_API_KEY and SENDGRID_SENDER are required")
    }
    mailer.setApiKey(apiKey)
    return mailer.send({ ...email, from })
  },
})
