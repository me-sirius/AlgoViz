const Contact = require("../models/contact.model");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const connectDB = require("../db/db");
// =========================================================
// 1. PUBLIC: SUBMIT QUERY (Smart Grouping Logic)
// =========================================================
// If an OPEN ticket exists for this email, append the message.
// Otherwise, create a NEW ticket.
exports.submitContactForm = async (req, res) => {
  try {
    connectDB();
    const { name, email, subject, message, userId } = req.body; // Pass userId if logged in

    const ticketId =
      "TKT-" + crypto.randomBytes(3).toString("hex").toUpperCase();

    const ticket = await Contact.create({
      ticketId,
      userId: userId || null, // Optional: Link to user account
      name,
      email: email.toLowerCase(),
      subject: subject || "Support Request",
      status: "Open",
      messages: [
        {
          sender: "User",
          content: message,
          timestamp: new Date(),
        },
      ],
    });

    res
      .status(201)
      .json({ success: true, message: "Ticket Created", ticketId });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 2. USER: Get My Tickets
exports.getMyTickets = async (req, res) => {
  try {
    connectDB();
    // Assuming you have middleware that puts user info in req.user
    const email = req.user.email;

    // Find tickets matching user's email
    const tickets = await Contact.find({ email: email }).sort({
      updatedAt: -1,
    });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets" });
  }
};

// 3. USER: Reply to Specific Ticket
exports.userReply = async (req, res) => {
  try {
    connectDB();
    const { ticketId, message } = req.body;

    const ticket = await Contact.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Security: Ensure the ticket belongs to this user
    if (ticket.email !== req.user.email) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    ticket.messages.push({
      sender: "User",
      content: message,
      timestamp: new Date(),
    });

    // If ticket was closed, re-open it because user replied
    if (ticket.status === "Closed") ticket.status = "Open";

    ticket.updatedAt = new Date();
    await ticket.save();

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ message: "Reply failed" });
  }
};

// =========================================================
// 2. ADMIN: FETCH ALL TICKETS
// =========================================================
exports.getAllTickets = async (req, res) => {
  try {
    connectDB();
    // Sort by 'updatedAt' descending so recent chats appear first
    const tickets = await Contact.find().sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error("Fetch Tickets Error:", error);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};

// =========================================================
// 3. ADMIN: FETCH ONLY OPEN TICKETS
// =========================================================
exports.getOpenTickets = async (req, res) => {
  try {
    connectDB();
    const tickets = await Contact.find({ status: "Open" }).sort({
      updatedAt: -1,
    });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error("Fetch Open Tickets Error:", error);
    res.status(500).json({ message: "Failed to fetch open tickets" });
  }
};

// =========================================================
// 4. ADMIN: REPLY TO TICKET (Email + DB Save)
// =========================================================
exports.replyToTicket = async (req, res) => {
  try {
    connectDB();
    const { ticketId, message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Reply message cannot be empty" });
    }

    // Find the ticket
    // Note: We use findById if you passed the MongoDB _id, or findOne if passing "TKT-XXX"
    // Assuming ticketId is the MongoDB _id here based on your frontend code
    const ticket = await Contact.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // 1. Add Admin Message to Database
    ticket.messages.push({
      sender: "Admin",
      content: message,
      timestamp: new Date(),
    });

    // Mark as updated
    ticket.updatedAt = new Date();
    await ticket.save();

    // 2. Send Email Notification via Nodemailer
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail", // Or your SMTP provider
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD, // App Password
        },
      });
      const ticketLink = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }contact`;
      const mailOptions = {
        from: `"Support Team" <${process.env.EMAIL_USER}>`,
        to: ticket.email,
        subject: `Update on Ticket #${ticket.ticketId}`,
        text: message, // Fallback for old email clients
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">New Reply Received</h2>
            <p>Hello <strong>${ticket.name}</strong>,</p>
            <p>Our support team has replied to your query regarding: <em>"${ticket.subject}"</em>.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${ticketLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Reply on Dashboard
              </a>
            </div>

            <p style="color: #666; font-size: 12px;">
              Please do not reply to this email. This is an automated notification.
            </p>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email Sending Failed:", emailError);
      // We don't fail the request if email fails, but we log it.
      // You might want to return a warning here.
    }

    res
      .status(200)
      .json({ success: true, message: "Reply sent and saved.", data: ticket });
  } catch (error) {
    console.error("Reply Error:", error);
    res.status(500).json({ message: "Server error while replying." });
  }
};

// =========================================================
// 5. ADMIN: UPDATE STATUS (Close/Re-open)
// =========================================================
exports.updateTicketStatus = async (req, res) => {
  try {
    connectDB();
    const { id } = req.params;
    const { status } = req.body; // Expecting "Open" or "Closed"

    if (!["Open", "Closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ticket = await Contact.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    // console.log("status : ", status);
    res.status(200).json({
      success: true,
      message: `Ticket marked as ${status}`,
      data: ticket,
    });
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// =========================================================
// 6. ADMIN: DELETE TICKET PERMANENTLY
// =========================================================
exports.deleteTicket = async (req, res) => {
  try {
    connectDB();
    const { id } = req.params;

    const deletedTicket = await Contact.findByIdAndDelete(id);

    if (!deletedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Failed to delete ticket" });
  }
};
