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
  const compiled = handlebars.compile(template);
  const htmlContent = compiled({});

  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: toAddr,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function sendEmailWithTextBody(
  toAddr: string,
  subject: string,
  body: string,
) {
  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: toAddr,
      subject,
      text: body,
    });
  } catch (error) {
    console.log(error);
  }
}
