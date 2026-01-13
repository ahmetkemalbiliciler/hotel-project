import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const QUEUE_URL = process.env.SQS_QUEUE_URL;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function pollMessages() {
  if (!QUEUE_URL) {
    console.warn("SQS_QUEUE_URL is not defined. Skipping SQS polling.");
    return;
  }

  const params = {
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
  };

  try {
    const data = await sqsClient.send(new ReceiveMessageCommand(params));
    if (data.Messages) {
      for (const message of data.Messages) {
        const bookingData = JSON.parse(message.Body);
        await sendReservationEmail(bookingData);
        await sqsClient.send(
          new DeleteMessageCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
          })
        );
        console.log("[SQS] Message processed and deleted.");
      }
    }
  } catch (err) {
    console.error("Error polling SQS:", err);
  } finally {
    setImmediate(pollMessages);
  }
}

async function sendReservationEmail(details) {
  const emailUser = process.env.EMAIL_USER;

  // Konsola her zaman yazdır
  console.log("--------------------------------------------------");
  console.log("📨 NEW RESERVATION NOTIFICATION");
  console.log(`   Booking ID: ${details.bookingId}`);
  console.log(`   Hotel: ${details.hotelName || "N/A"}`);
  console.log(`   Room Type: ${details.roomType || "N/A"}`);
  console.log(`   Check-in: ${details.startDate}`);
  console.log(`   Check-out: ${details.endDate}`);
  console.log(`   Nights: ${details.nights || "N/A"}`);
  console.log(`   Price/Night: €${details.pricePerNight || "N/A"}`);
  console.log(`   Total: €${details.totalPrice || "N/A"}`);
  console.log(`   User Email: ${details.userEmail || "N/A"}`);
  console.log("--------------------------------------------------");

  const recipient = details.userEmail && details.userEmail !== "Bilinmiyor" ? details.userEmail : emailUser;

  if (!recipient) {
    console.error("❌ Email error: No recipient defined (userEmail missing and EMAIL_USER not set)");
    return;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏨 HotelBooking</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Rezervasyonunuz Onaylandı!</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 22px;">Merhaba,</h2>
          <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
            Rezervasyonunuz başarıyla oluşturuldu. Aşağıda rezervasyon detaylarınızı bulabilirsiniz.
          </p>
          
          <!-- Booking Details Card -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e2e8f0;">
            
            <!-- Reservation Number -->
            <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0 0 5px; font-size: 12px; text-transform: uppercase;">Rezervasyon No</p>
              <p style="color: #6366f1; margin: 0; font-size: 24px; font-weight: bold;">#${details.bookingId}</p>
            </div>
            
            <!-- Hotel Info -->
            <div style="margin-bottom: 20px;">
              <p style="color: #64748b; margin: 0 0 5px; font-size: 12px; text-transform: uppercase;">Otel</p>
              <p style="color: #1e293b; margin: 0; font-size: 18px; font-weight: bold;">${details.hotelName || "Bilinmiyor"}</p>
              <p style="color: #64748b; margin: 5px 0 0; font-size: 14px;">${details.roomType || "Standard"} Oda</p>
            </div>
            
            <!-- Dates -->
            <div style="display: flex; margin-bottom: 20px;">
              <div style="flex: 1;">
                <p style="color: #64748b; margin: 0 0 5px; font-size: 12px; text-transform: uppercase;">Giriş</p>
                <p style="color: #1e293b; margin: 0; font-size: 16px; font-weight: bold;">${formatDate(details.startDate)}</p>
              </div>
              <div style="flex: 1;">
                <p style="color: #64748b; margin: 0 0 5px; font-size: 12px; text-transform: uppercase;">Çıkış</p>
                <p style="color: #1e293b; margin: 0; font-size: 16px; font-weight: bold;">${formatDate(details.endDate)}</p>
              </div>
            </div>
            
            <!-- Price -->
            <div style="background: #ffffff; border-radius: 8px; padding: 15px; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #64748b;">€${details.pricePerNight || 0} x ${details.nights || 1} gece</span>
                <span style="color: #1e293b;">€${details.totalPrice || 0}</span>
              </div>
              <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between;">
                <span style="color: #1e293b; font-weight: bold;">Toplam</span>
                <span style="color: #6366f1; font-size: 20px; font-weight: bold;">€${details.totalPrice || 0}</span>
              </div>
            </div>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            Sorularınız için bizimle iletişime geçebilirsiniz. İyi tatiller dileriz! 🌴
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #1e293b; padding: 25px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">© 2026 HotelBooking. Tüm hakları saklıdır.</p>
          <p style="color: #64748b; margin: 10px 0 0; font-size: 11px;">Bu e-posta otomatik olarak gönderilmiştir.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"HotelBooking" <${emailUser}>`,
    to: recipient,
    subject: `🏨 Rezervasyon Onayı - #${details.bookingId} | ${details.hotelName || "HotelBooking"}`,
    html: emailHtml,
  };

  try {
    console.log(`✉️  Sending email to: ${recipient}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ EMAIL SENT!");
    console.log(`   Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
