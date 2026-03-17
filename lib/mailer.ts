import nodemailer from "nodemailer";

export async function sendApiDownAlert(error: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ALERT_EMAIL_FROM,
      pass: process.env.ALERT_EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.ALERT_EMAIL_FROM,
    to: process.env.ALERT_EMAIL_TO,
    subject: "🚨 calm-layer: Nova API is DOWN",
    text: `The Nova API appears to be down.\n\nError: ${error}\nTime: ${new Date().toISOString()}`,
  });
}
