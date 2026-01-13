import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import dotenv from "dotenv";

dotenv.config();

const client = new SQSClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const QUEUE_URL = process.env.SQS_QUEUE_URL;

export async function sendBookingNotification(bookingDetails) {
  if (!QUEUE_URL) {
    console.warn("SQS_QUEUE_URL is not defined. Skipping booking notification.");
    return;
  }

  const params = {
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(bookingDetails),
  };

  try {
    const data = await client.send(new SendMessageCommand(params));
    console.log("Booking notification sent to SQS:", data.MessageId);
  } catch (err) {
    console.error("Error sending booking notification to SQS:", err);
  }
}
