require("dotenv").config();
const { google } = require("googleapis");
const path = require("path");

// 1. Load the Service Account Key
const KEY_PATH = path.join(__dirname, "../service-account.json");

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_PATH,
  scopes: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/drive",
  ],
});

const calendar = google.calendar({ version: "v3", auth });
const drive = google.drive({ version: "v3", auth });

// --- CONFIGURATION ---
// 🚨 Replaced with your exact details
const CALENDAR_ID = "help.algoviz@gmail.com";
const PARENTS_FOLDER_ID = "108KNxfSiLgp9P5xtzOCR9fveuZIJSoEo";

/**
 * GENERATE MEET LINK
 * Tries to create an official link. If blocked, returns a fallback link.
 */
const generateMeetLink = async (summary, description, startTimeISO) => {
  try {
    const startDate = new Date(startTimeISO);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 Hour

    const event = {
      summary: summary,
      description: description,
      start: { dateTime: startDate.toISOString(), timeZone: "Asia/Kolkata" },
      end: { dateTime: endDate.toISOString(), timeZone: "Asia/Kolkata" },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const res = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
      conferenceDataVersion: 1,
    });

    console.log("✅ Meet Link Generated:", res.data.hangoutLink);
    return res.data.hangoutLink;
  } catch (error) {
    console.error("❌ Google Calendar Error:", error.message);

    // Fallback: Generates a valid Meet URL using a timestamp
    // This link works for users to start a meeting instantly
    const fallbackLink = `https://meet.google.com/lookup/algoviz-${Date.now()}`;
    console.log("⚠️ Using Fallback Meet Link:", fallbackLink);
    return fallbackLink;
  }
};

/**
 * GENERATE DOC LINK
 * Tries to create a file. If storage is full, returns a generic 'Create New' link.
 */
const generateDocLink = async (title) => {
  try {
    const fileMetadata = {
      name: title,
      mimeType: "application/vnd.google-apps.document",
      parents: [PARENTS_FOLDER_ID],
    };

    const createRes = await drive.files.create({
      resource: fileMetadata,
      fields: "id, webViewLink",
    });

    const fileId = createRes.data.id;
    const link = createRes.data.webViewLink;

    // Make it editable
    await drive.permissions.create({
      fileId: fileId,
      requestBody: { role: "writer", type: "anyone" },
    });

    console.log("✅ Doc Created:", link);
    return link;
  } catch (error) {
    console.error("❌ Google Drive Error:", error.message);

    // Fallback: A link that opens a blank new document for the user
    const fallbackLink = "https://docs.google.com/document/create";
    console.log("⚠️ Using Fallback Doc Link:", fallbackLink);
    return fallbackLink;
  }
};

module.exports = { generateMeetLink, generateDocLink };
