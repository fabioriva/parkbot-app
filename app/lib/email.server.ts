import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({ to, subject, text, html }): Promise<void> {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_SENDER,
      subject,
      text,
      html,
    };
    console.log(msg);
    await sgMail.send(msg);
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
}
