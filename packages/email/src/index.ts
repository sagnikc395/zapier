import dotenv from "dotenv";
import nodemailer from "nodemailer";

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
