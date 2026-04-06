// utils/twilio.util.js
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let client = null;

function getTwilioClient() {
  if (!client) {
    if (!accountSid || !authToken || !fromPhone) {
      throw new Error(
        "Thiếu cấu hình Twilio trong .env (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)",
      );
    }
    client = twilio(accountSid, authToken);
  }
  return client;
}

export async function sendOtpViaTwilio(to, otpCode) {
  if (!to) throw new Error("Số điện thoại không hợp lệ");
  const twilioClient = getTwilioClient();
  const message = `Mã xác thực Smart Restaurant: ${otpCode}`;
  await twilioClient.messages.create({
    body: message,
    from: fromPhone,
    to,
  });
}
