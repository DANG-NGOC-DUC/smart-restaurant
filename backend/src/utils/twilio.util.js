// utils/twilio.util.js
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromPhone) {
  throw new Error("Thiếu cấu hình Twilio trong .env");
}

const client = twilio(accountSid, authToken);

export async function sendOtpViaTwilio(to, otpCode) {
  if (!to) throw new Error("Số điện thoại không hợp lệ");
  const message = `Mã xác thực Smart Restaurant: ${otpCode}`;
  await client.messages.create({
    body: message,
    from: fromPhone,
    to,
  });
}
