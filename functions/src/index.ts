import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();
const db = admin.firestore();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bamboo15bmt@gmail.com",
    pass: "roknrrcxgwandazx", // ✅ Không có khoảng trắng
  },
});

export const sendBookingReminders = functions.pubsub
  .schedule("every 60 minutes")
  .timeZone("Asia/Ho_Chi_Minh")
  .onRun(async () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const snapshot = await db.collection("bookings").get();
    const jobs: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const bookingTime = new Date(`${data.date}T${data.time}:00`);
      if (
        bookingTime > now &&
        bookingTime <= oneHourLater &&
        data.status === "booked"
      ) {
        const mailOptions = {
          from: "bamboo15bmt@gmail.com",
          to: data.userEmail,
          subject: "Nhắc hẹn đánh cầu lông",
          text: `Xin chào ${data.userName}, bạn có lịch đánh cầu lông vào lúc ${data.time} ngày ${data.date} tại sân ${data.courtId}.`,
        };
        jobs.push(
          transporter.sendMail(mailOptions).catch((err) => {
            console.error("Gửi email thất bại:", err);
          })
        );
      }
    });

    return Promise.all(jobs); // ✅ Nhớ return
  });
