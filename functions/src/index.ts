// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// const nodemailer = require('nodemailer');

// admin.initializeApp();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'your-email@gmail.com',
//     pass: 'your-email-password',
//   }
// });

// exports.sendEmailToUsers = functions.https.onRequest(async (req, res) => {
//   try {
//     // Lấy dữ liệu người dùng từ Firestore
//     const usersSnapshot = await admin.firestore().collection('users').get();
//     const users = usersSnapshot.docs.map(doc => doc.data());

//     // Duyệt qua tất cả người dùng và gửi email
//     users.forEach(user => {
//       const { name, email } = user;

//       const mailOptions = {
//         from: 'your-email@gmail.com',
//         to: email,
//         subject: 'Chào mừng bạn đến với hệ thống!',
//         text: `Xin chào ${name},\n\nCảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`
//       };

//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.log(error);
//         } else {
//           console.log('Email sent: ' + info.response);
//         }
//       });
//     });

//     res.status(200).send('Emails sent successfully');
//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).send('Error sending email');
//   }
// });
