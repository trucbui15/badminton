// "use client";

// import { useState } from 'react';

// // Định nghĩa kiểu cho đối tượng gửi email
// interface EmailData {
//   email: string;
//   subject: string;
//   body: string;
// }

// export default function Home() {
//   const [email, setEmail] = useState('');
//   const [subject, setSubject] = useState('');
//   const [body, setBody] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   // Sửa lại hàm sendEmailToAppsScript
//   const sendEmailToAppsScript = async ({ email, subject, body }: EmailData) => {
//     const res = await fetch('/api/sendEmail', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, subject, body }),
//     });

//     if (!res.ok) {
//       throw new Error('Failed to send email');
//     }

//     return res.json();
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const data = await sendEmailToAppsScript({ email, subject, body });
//       setMessage(data.message);
//     } catch (error) {
//       setMessage('Error sending email');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl mb-4">Send Email Form</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="email" className="block">Email</label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="border p-2 w-full"
//             required
//           />
//         </div>
//         <div>
//           <label htmlFor="subject" className="block">Subject</label>
//           <input
//             type="text"
//             id="subject"
//             value={subject}
//             onChange={(e) => setSubject(e.target.value)}
//             className="border p-2 w-full"
//             required
//           />
//         </div>
//         <div>
//           <label htmlFor="body" className="block">Body</label>
//           <textarea
//             id="body"
//             value={body}
//             onChange={(e) => setBody(e.target.value)}
//             className="border p-2 w-full"
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-500 text-white py-2 px-4"
//         >
//           {loading ? 'Sending...' : 'Send Email'}
//         </button>
//       </form>

//       {message && <p className="mt-4">{message}</p>}
//     </div>
//   );
// }