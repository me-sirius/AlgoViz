require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const commonStyle = `font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;`;
const btnStyle = `display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;`;

// 1. Initial Confirmation (Sent when paid)
const sendBookingEmails = async (student, mentor, details) => {
  try {
    const { date, timeSlot, topic, resumeUrl } = details;

    // Student Email
    const studentHtml = `
      <div style="${commonStyle}">
        <h2 style="color: #0d9488;">Interview Booked Successfully!</h2>
        <p>Hi <strong>${student.name}</strong>,</p>
        <p>Your session for <strong>${topic}</strong> is confirmed.</p>
        <p><strong>📅 Date:</strong> ${date} at ${timeSlot}</p>
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeeba; color: #856404;">
          <strong>Next Step:</strong> Your mentor will update the meeting links soon. You will be notified once they are added.
        </div>
      </div>
    `;

    // Mentor Email
    const mentorHtml = `
      <div style="${commonStyle}">
        <h2 style="color: #0d9488;">New Session Booked</h2>
        <p>Hi <strong>${mentor.name}</strong>,</p>
        <p>You have a new session with <strong>${student.name}</strong>.</p>
        <p><strong>📅 Date:</strong> ${date} at ${timeSlot}</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <br/>
        <a href="${resumeUrl}" style="color: #2563eb; font-weight: bold;">View Student Resume</a>
        <br/><br/>
        <p><strong>Action Required:</strong> Please go to your dashboard and add the Meeting Link & Doc Link before the session starts.</p>
      </div>
    `;

    await Promise.all([
      transporter.sendMail({
        from: `"AlgoViz" <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: "✅ Booking Confirmed - AlgoViz",
        html: studentHtml,
      }),
      transporter.sendMail({
        from: `"AlgoViz" <${process.env.EMAIL_USER}>`,
        to: mentor.email,
        subject: "📅 New Session Booked - Action Required",
        html: mentorHtml,
      }),
    ]);

    console.log("✅ Booking Emails sent.");
  } catch (error) {
    console.error("❌ Email Error:", error.message);
  }
};

// 2. Update Notification (Sent when mentor adds links)
const sendLinkUpdateEmail = async (student, interview) => {
  try {
    const html = `
      <div style="${commonStyle}">
        <h2 style="color: #0d9488;">Links Updated!</h2>
        <p>Hi <strong>${student.name}</strong>,</p>
        <p>Your mentor has added the meeting links for your session.</p>
        <br/>
        <a href="${interview.meetingLink}" style="${btnStyle}">Join Meeting</a>
        <br/><br/>
        <a href="${interview.googleDocLink}" style="color: #2563eb;">Open Shared Document</a>
      </div>
    `;

    await transporter.sendMail({
      from: `"AlgoViz" <${process.env.EMAIL_USER}>`,
      to: student.email,
      subject: "🚀 Interview Links Ready - AlgoViz",
      html: html,
    });
    console.log("✅ Update Email sent to student.");
  } catch (error) {
    console.error("❌ Update Email Error:", error.message);
  }
};

module.exports = { sendBookingEmails, sendLinkUpdateEmail };
