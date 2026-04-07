import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "fs";
import handlebars from "handlebars";

dotenv.config({
  path: __dirname + "/../.env",
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.SMTP_HOST,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(
  toAddr: string,
  subject: string,
  body: string,
  user?: string,
) {
  const path = "/templates/" + body;
  const template = fs.readFileSync(__dirname + path, "utf-8").toString();
  const html = handlebars.compile(template);
  const htmlContent = html || "";

  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      toAddr,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.log(error);
  }
}
