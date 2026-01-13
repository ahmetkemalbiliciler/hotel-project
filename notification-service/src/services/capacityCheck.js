import cron from "node-cron";
import { pool } from "../db/index.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export function initCapacityCron() {
  // Her gece 00:00'da çalışır (0 0 * * *)
  cron.schedule("0 0 * * *", async () => {
    console.log("Running nightly capacity check...");

    try {
      const nextMonthStart = new Date();
      const nextMonthEnd = new Date();
      nextMonthEnd.setMonth(nextMonthEnd.getMonth() + 1);

      // Önümüzdeki 1 ay içinde kapasitesi 5'in altına düşen odaları bul
      const { rows } = await pool.query(
        `
        SELECT 
          h.name as hotel_name, 
          r.type as room_type, 
          a.available_count,
          a.start_date,
          a.end_date
        FROM hotels h
        JOIN rooms r ON r.hotel_id = h.id
        JOIN availability a ON a.room_id = r.id
        WHERE a.start_date >= $1 
          AND a.end_date <= $2
          AND a.available_count < 5
        ORDER BY a.start_date ASC
      `,
        [nextMonthStart, nextMonthEnd]
      );

      if (rows.length > 0) {
        console.warn(`⚠️  Found ${rows.length} low capacity records.`);
        await sendLowCapacityEmail(rows);
      } else {
        console.log("✅ No low capacity issues found for the next month.");
      }
    } catch (err) {
      console.error("Error in capacity check cron:", err);
    }
  });
}

async function sendLowCapacityEmail(records) {
  const emailUser = process.env.EMAIL_USER;

  // Tablo satırlarını oluştur
  const tableRows = records.map(r => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.hotel_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.room_type}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        ${new Date(r.start_date).toLocaleDateString("tr-TR")}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #dc2626; font-weight: bold;">
        ${r.available_count}
      </td>
    </tr>
  `).join('');

  if (!emailUser) {
    console.log("--------------------------------------------------");
    console.log("✉️  CAPACITY ALERT SIMULATION (EMAIL_USER not configured)");
    console.table(records.map(r => ({
      Hotel: r.hotel_name,
      Type: r.room_type,
      Date: new Date(r.start_date).toLocaleDateString(),
      Count: r.available_count
    })));
    console.log("--------------------------------------------------");
    return;
  }

  const mailOptions = {
    from: `"HotelBooking System" <${emailUser}>`,
    to: emailUser, // Admin olarak kendimize gönderiyoruz
    subject: `⚠️ Kritik Kapasite Uyarısı - Gelecek Ay`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Kritik Kapasite Raporu</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc;">
          <p style="color: #333;">Sayın Yönetici,</p>
          <p style="color: #555;">
            Önümüzdeki ay için bazı otellerde oda kapasitesi <strong>kritik seviyenin (%20 veya 5 oda altı)</strong> altına düşmüştür.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; background: white; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Otel</th>
                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Oda Tipi</th>
                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Tarih</th>
                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Kalan</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <p style="color: #777; font-size: 12px; margin-top: 20px;">
            Bu rapor otomatik olarak oluşturulmuştur.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ CAPACITY ALERT EMAIL SENT!");
    console.log(`   Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
}
