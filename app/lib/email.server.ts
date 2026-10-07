import sgMail from "@sendgrid/mail"

interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailOptions): Promise<void> {
  try {
    const apiKey = process.env.SENDGRID_API_KEY
    const from = process.env.SENDGRID_SENDER
    if (!apiKey?.trim() || !from?.trim()) {
      throw new Error("SENDGRID_API_KEY and SENDGRID_SENDER are required")
    }
    sgMail.setApiKey(apiKey)
    const msg = {
      to,
      from,
      subject,
      text,
      html,
    }
    await sgMail.send(msg)
  } catch (error) {
    console.error(error)
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = error.response
      if (
        typeof response === "object" &&
        response !== null &&
        "body" in response
      ) {
        console.error(response.body)
      }
    }
  }
}
