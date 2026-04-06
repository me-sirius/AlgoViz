// const User = require("../models/user.model");
// // const otpGenerator = require("otp-generator");
// const nodemailer = require("nodemailer");
// const { OAuth2Client } = require("google-auth-library");
// const crypto = require("crypto");
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_APP_PASSWORD,
//   },
// });
// module.exports.register = async (req, res, next) => {
//   try {
//     const { name, email, password } = req.body;
//     console.log("Registration request:", req.body);

//     if (!name || !email || !password) {
//       console.log("Testing 1");
//       return res.status(404).json({ message: "Email or Password missing" });
//     }

//     const alreadyExist = await User.findOne({ email });
//     console.log("User exists check:", alreadyExist);

//     if (alreadyExist) {
//       console.log("Testing 2");
//       return res.status(404).json({ message: "User Already Exists" });
//     }

//     const hashedPassword = await User.hashPassword(password);
//     console.log("Password hashed successfully");

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       memberSince: new Date().toISOString(), // Adding the required memberSince field
//     });

//     const token = await user.generateAuthToken();
//     res.cookie("token", token);
//     console.log("User created successfully:", user);
//     return res.status(201).json({ user, token });
//   } catch (error) {
//     console.log("Registration error details:", error.message);
//     console.log("Full error:", error);
//     return res.status(500).json({ message: "Server error: " + error.message });
//   }
// };

// module.exports.login = async (req, res, next) => {
//   try {
//     console.log("Login request:", req.body);
//     const { email, password, rememberMe } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Please enter your email or password" });
//     }

//     const user = await User.findOne({ email });
//     console.log("User found:", user ? user.email : "Not found");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const comparePassword = await user.comparePassword(password);
//     console.log("Password comparison result:", comparePassword);

//     if (!comparePassword) {
//       return res.status(400).json({ message: "Password is incorrect" });
//     }

//     const token = await user.generateAuthToken();
//     console.log("Generated token successfully");

//     res.cookie("token", token);
//     return res.status(200).json({ user, token });
//   } catch (error) {
//     console.log("Login error:", error.message);
//     console.log("Full error:", error);
//     return res.status(500).json({ message: "Server error: " + error.message });
//   }
// };

// module.exports.sendOtp = async (req, res, next) => {
//   console.log("sendOtp me yaha aa rha ha");
//   try {
//     const { email } = req.body;

//     // Check if user exists
//     let user = await User.findOne({ email });
//     if (user) {
//       // If user exists, check if they are already verified
//       if (user.isVerified) {
//         console.log("User already verified");
//         return res
//           .status(400)
//           .json({ message: "User already Exist Please Sigin" });
//       }
//     }

//     if (!user) {
//       // Create temporary user
//       user = new User({
//         email,
//         password: "temporary", // Will be updated during verification
//         name: "temporary",
//       });
//     }
//     // Generate OTP
//     const otp = await user.generateOTP();
//     console.log("otp : ", otp);
//     // user.otp = otp;
//     // user.otpExpiry = Date.now() + 10 * 60 * 1000;
//     await user.save({ validateModifiedOnly: true });
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Verify your AlgoViz account",
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         </head>
//         <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

//           <div style="
//             max-width: 600px;
//             margin: 40px auto;
//             background-color: #1e293b;
//             border-radius: 24px;
//             overflow: hidden;
//             box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
//             border: 1px solid #334155;
//           ">

//             <!-- Header with Gradient Border Top -->
//             <div style="
//               height: 6px;
//               background: linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6);
//               width: 100%;
//             "></div>

//             <div style="padding: 40px 40px 20px 40px; text-align: center;">
//               <!-- Logo Text -->
//               <h1 style="
//                 margin: 0;
//                 font-size: 32px;
//                 font-weight: 800;
//                 color: #ffffff;
//                 letter-spacing: -1px;
//               ">
//                 Algo<span style="color: #22d3ee;">Viz</span>
//               </h1>
//             </div>

//             <div style="padding: 20px 40px 40px 40px;">
//               <h2 style="
//                 margin-top: 0;
//                 font-size: 24px;
//                 font-weight: 600;
//                 color: #f1f5f9;
//                 text-align: center;
//               ">Verify Your Identity</h2>

//               <p style="
//                 font-size: 16px;
//                 line-height: 1.6;
//                 color: #cbd5e1;
//                 text-align: center;
//                 margin-bottom: 30px;
//               ">
//                 Welcome to AlgoViz! To secure your account and start mastering algorithms, please enter the following verification code:
//               </p>

//               <!-- OTP Container -->
//               <div style="
//                 background: rgba(6, 182, 212, 0.05);
//                 border: 1px solid rgba(6, 182, 212, 0.3);
//                 border-radius: 16px;
//                 padding: 30px;
//                 text-align: center;
//                 margin-bottom: 30px;
//               ">
//                 <p style="
//                   margin: 0 0 10px 0;
//                   font-size: 12px;
//                   text-transform: uppercase;
//                   letter-spacing: 1.5px;
//                   color: #22d3ee;
//                   font-weight: 600;
//                 ">Verification Code</p>
//                 <h1 style="
//                   font-size: 42px;
//                   margin: 0;
//                   letter-spacing: 6px;
//                   font-family: 'Courier New', monospace;
//                   color: #ffffff;
//                   font-weight: 700;
//                 ">${otp}</h1>
//               </div>

//               <div style="text-align: center; font-size: 14px; color: #94a3b8;">
//                 <p style="margin: 0;">⏳ This code expires in 10 minutes.</p>
//                 <p style="margin: 10px 0 0 0;">If you didn't request this code, you can safely ignore this email.</p>
//               </div>
//             </div>

//             <!-- Footer -->
//             <div style="
//               background-color: #0f172a;
//               padding: 30px;
//               text-align: center;
//               border-top: 1px solid #334155;
//             ">
//               <p style="margin: 0; font-size: 13px; color: #64748b;">
//                 © ${new Date().getFullYear()} AlgoViz Platform. All rights reserved.
//               </p>
//               <div style="margin-top: 15px;">
//                 <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 13px; margin: 0 10px;">Privacy Policy</a>
//                 <span style="color: #334155;">|</span>
//                 <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 13px; margin: 0 10px;">Help Center</a>
//               </div>
//             </div>
//           </div>

//         </body>
//         </html>
//       `,
//     });
//     const check = await User.find({ email });
//     console.log(check);
//     return res.status(200).json({ message: "OTP sent successfully" });
//   } catch (error) {
//     console.error("Send OTP error:", error);
//     return res.status(500).json({ message: "Failed to send OTP" });
//   }
// };

// module.exports.verifyOtp = async (req, res, next) => {
//   console.log("verifyOtp me yaha aa rha ha");
//   try {
//     const { email, otp, name, password } = req.body;
//     console.log("otp : ", otp);
//     // Find user by email
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }
//     console.log(user);
//     console.log(user.otp);
//     // Check if OTP exists and is valid
//     if (!user.otp || user.otp !== otp) {
//       console.log("user.otp : ", user.otp, " ", otp);
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     // Check if OTP has expired
//     if (Date.now() > user.otpExpiry) {
//       // await user.clearOTP();
//       return res.status(400).json({ message: "OTP has expired" });
//     }

//     // Update user details
//     const hashPassword = await User.hashPassword(password);
//     user.name = name;
//     user.password = hashPassword;
//     user.isVerified = true;
//     user.authMethod = "email";
//     // await user.clearOTP(); // Clear OTP after successful verification

//     // Generate token
//     const token = await user.generateAuthToken();
//     await user.save({ validateModifiedOnly: true });
//     // Set cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });
//     res.cookie("userId", user._id, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     return res.status(201).json({
//       success: true,
//       token,
//       user,
//     });
//   } catch (error) {
//     console.error("Verify OTP error:", error);
//     res.status(500).json({ message: "Failed to verify OTP" });
//   }
// };
// exports.getUserDetails = async (req, res) => {
//   try {
//     const userId = req.params.id; // Get from URL params, not body

//     const user = await User.findById(userId).select("-password");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     console.error("Error fetching user details:", error);

//     if (error.kind === "ObjectId") {
//       return res.status(404).json({ message: "Invalid user ID" });
//     }

//     res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports.forgotPassword = async (req, res, next) => {
//   const { email } = req.body;
//   console.log("forgot password me aaya hu", email);
//   // 1. Find user
//   const user = await User.findOne({ email });
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }
//   // 2. Generate reset token (expires in 10 mins)
//   const resetToken = crypto.randomBytes(20).toString("hex");
//   user.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");
//   user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
//   await user.save();
//   // 3. Send email
//   const resetUrl = `${req.protocol}://${req.get(
//     "host"
//   )}/users/reset-password/${resetToken}`;
//   console.log("yaha tk to aagay ab kya", resetUrl);

//   const message = `
// <!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Password Reset Request</title>
//     <style>
//       body {
//         font-family: Arial, sans-serif;
//         margin: 0;
//         padding: 0;
//         background-color: #f7f9fc;
//       }
//       .email-container {
//         max-width: 600px;
//         margin: 20px auto;
//         background: #ffffff;
//         border-radius: 8px;
//         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//         overflow: hidden;
//       }
//       .email-header {
//         background: #4caf50;
//         color: white;
//         padding: 20px;
//         text-align: center;
//       }
//       .email-body {
//         padding: 20px;
//       }
//       .email-body p {
//         margin: 0 0 10px;
//         line-height: 1.5;
//         color: #333;
//       }
//       .email-body a {
//         color: #4caf50;
//         text-decoration: none;
//         font-weight: bold;
//       }
//       .email-footer {
//         text-align: center;
//         padding: 10px;
//         background: #f1f1f1;
//         font-size: 12px;
//         color: #666;
//       }
//     </style>
//   </head>
//   <body>
//     <div class="email-container">
//       <div class="email-header">
//         <h1>AlgoViz</h1>
//       </div>
//       <div class="email-body">
//         <h2>Password Reset Request</h2>
//         <p>Hello,</p>
//         <p>You requested to reset your password. Click the link below to reset your password:</p>
//         <p>
//           <a href="${resetUrl}" target="_blank">${resetUrl}</a>
//         </p>
//         <p>Please note that this link will expire in 10 minutes.</p>
//         <p>If you did not request a password reset, please ignore this email.</p>
//       </div>
//       <div class="email-footer">
//         <p>&copy; ${new Date().getFullYear()} AlgoViz. All Rights Reserved.</p>
//       </div>
//     </div>
//   </body>
// </html>
// `;
//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Password Reset Request",
//       html: message,
//     });

//     res.json({ message: "Reset link sent to email" });
//   } catch (err) {
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;
//     await user.save();
//     res.status(500).json({ message: "Email could not be sent" });
//   }
// };

// module.exports.getResetPassword = async (req, res, next) => {
//   console.log("ha sarkar");
//   const { token } = req.params;
//   try {
//     // Hash the token to match the one stored in the database
//     const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
//     // Find the user with the matching token and check if it is still valid
//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpire: { $gt: Date.now() }, // Ensure token has not expired
//     });

//     if (!user) {
//       return res.status(400).send("Invalid or expired token");
//     }

//     // Render the EJS file and pass the token to the template
//     return res.render("resetPassword", { token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("An error occurred while processing your request.");
//   }
// };

// module.exports.googleLogin = async (req, res, next) => {
//   try {
//     const { code } = req.body;
//     const client = new OAuth2Client(
//       process.env.GOOGLE_CLIENT_ID,
//       process.env.GOOGLE_CLIENT_SECRET,
//       process.env.GOOGLE_REDIRECT_URI
//     );

//     // Exchange authorization code for tokens
//     const { tokens } = await client.getToken(code);

//     // Verify the ID token
//     const ticket = await client.verifyIdToken({
//       idToken: tokens.id_token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { email, name, picture, sub: googleId } = payload;

//     // Check if user exists
//     let user = await User.findOne({
//       $or: [{ email }, { googleId }],
//     });

//     if (!user) {
//       // Create new user without password
//       user = new User({
//         name,
//         email,
//         googleId,
//         avatar: picture,
//         isVerified: true,
//         password: "google_oauth_no_password",
//         authMethod: "google",
//       });
//       await user.save();
//     } else {
//       // User exists - update Google credentials if needed
//       if (!user.googleId) {
//         user.googleId = googleId;
//         user.authMethod = "google";
//         await user.save();
//       }
//       // Update profile picture if empty
//       if (!user.avatar) {
//         user.avatar = picture;
//         await user.save();
//       }
//     }

//     // Generate JWT
//     const token = await user.generateAuthToken();

//     res.status(200).json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//         authMethod: user.authMethod,
//       },
//     });
//   } catch (error) {
//     console.error("Google authentication error:", error);
//     res.status(400).json({
//       message: "Google authentication failed",
//       error: error.message,
//     });
//   }
// };

const User = require("../models/user.model");
const Interview = require("../models/interview.model");
const Notification = require("../models/notification.model");
// const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const connectDB = require("../db/db"); // <--- IMPORT THE DB CONNECTION HERE
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

module.exports.register = async (req, res, next) => {
  try {
    // await connectDB(); // <--- CONNECT BEFORE QUERYING
    const { name, email, password } = req.body;
    console.log("Registration request:", req.body);

    if (!name || !email || !password) {
      console.log("Testing 1");
      return res.status(404).json({ message: "Email or Password missing" });
    }

    const alreadyExist = await User.findOne({ email });
    console.log("User exists check:", alreadyExist);

    if (alreadyExist) {
      console.log("Testing 2");
      return res.status(404).json({ message: "User Already Exists" });
    }

    const hashedPassword = await User.hashPassword(password);
    console.log("Password hashed successfully");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      memberSince: new Date().toISOString(),
    });

    const token = await user.generateAuthToken();
    res.cookie("token", token);
    console.log("User created successfully:", user);
    return res.status(201).json({ user, token });
  } catch (error) {
    console.log("Registration error details:", error.message);
    console.log("Full error:", error);
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports.login = async (req, res, next) => {
  try {
    // await connectDB(); // <--- CONNECT BEFORE QUERYING
    console.log("Login request:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter your email or password" });
    }
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    console.log("User found:", user ? user.email : "Not found");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (
      user.authMethod === "google" &&
      user.password === "google_oauth_no_password"
    ) {
      return res.status(400).json({
        message: "This account uses Google Login. Please sign in with Google.",
      });
    }
    const comparePassword = await user.comparePassword(password);
    console.log("Password comparison result:", comparePassword);

    if (!comparePassword) {
      return res.status(400).json({ message: "Password is incorrect" });
    }
    const sessionId = uuidv4();
    user.currentSessionId = sessionId;
    // 1. Generate Token
    const token = jwt.sign(
      { id: user._id, sessionId: sessionId }, // <--- MUST include sessionId here
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    // const token = await user.generateAuthToken(sessionId);
    console.log("Generated token successfully");

    // --- 2. SECURITY UPDATE: Save this token to DB ---
    // This overwrites any previous token, invalidating old sessions
    user.currentSessionToken = token;
    user.lastRotationTime = new Date();
    await user.save({ validateModifiedOnly: true });
    console.log("Session token saved to database");
    res.cookie("token", token, {
      httpOnly: true,
      // 1. "Lax" allows the cookie to be sent between localhost:5173 and localhost:4000
      // "Strict" blocks it because the ports are different!
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

      // 2. "Secure" must be FALSE on localhost (http), TRUE in production (https)
      secure: process.env.NODE_ENV === "production",

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ user, token });
  } catch (error) {
    console.log("Login error:", error.message);
    console.log("Full error:", error);
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports.sendOtp = async (req, res, next) => {
  console.log("sendOtp me yaha aa rha ha");
  try {
    // await connectDB(); // <--- CONNECT BEFORE QUERYING
    const { email } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      // If user exists, check if they are already verified
      if (user.isVerified) {
        console.log("User already verified");
        return res
          .status(400)
          .json({ message: "User already Exist Please Sigin" });
      }
    }
    const normalizedEmail = email.toLowerCase();
    if (!user) {
      // Create temporary user
      user = new User({
        email: normalizedEmail,
        password: "temporary", // Will be updated during verification
        name: "temporary",
      });
    }
    // Generate OTP
    const otp = await user.generateOTP();
    console.log("otp : ", otp);
    // user.otp = otp;
    // user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save({ validateModifiedOnly: true });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your AlgoViz account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          
          <div style="
            max-width: 600px;
            margin: 40px auto;
            background-color: #1e293b;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            border: 1px solid #334155;
          ">
            
            <div style="
              height: 6px;
              background: linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6);
              width: 100%;
            "></div>

            <div style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="
                margin: 0;
                font-size: 32px;
                font-weight: 800;
                color: #ffffff;
                letter-spacing: -1px;
              ">
                Algo<span style="color: #22d3ee;">Viz</span>
              </h1>
            </div>

            <div style="padding: 20px 40px 40px 40px;">
              <h2 style="
                margin-top: 0;
                font-size: 24px;
                font-weight: 600;
                color: #f1f5f9;
                text-align: center;
              ">Verify Your Identity</h2>
              
              <p style="
                font-size: 16px;
                line-height: 1.6;
                color: #cbd5e1;
                text-align: center;
                margin-bottom: 30px;
              ">
                Welcome to AlgoViz! To secure your account and start mastering algorithms, please enter the following verification code:
              </p>

              <div style="
                background: rgba(6, 182, 212, 0.05);
                border: 1px solid rgba(6, 182, 212, 0.3);
                border-radius: 16px;
                padding: 30px;
                text-align: center;
                margin-bottom: 30px;
              ">
                <p style="
                  margin: 0 0 10px 0;
                  font-size: 12px;
                  text-transform: uppercase;
                  letter-spacing: 1.5px;
                  color: #22d3ee;
                  font-weight: 600;
                ">Verification Code</p>
                <h1 style="
                  font-size: 42px;
                  margin: 0;
                  letter-spacing: 6px;
                  font-family: 'Courier New', monospace;
                  color: #ffffff;
                  font-weight: 700;
                ">${otp}</h1>
              </div>

              <div style="text-align: center; font-size: 14px; color: #94a3b8;">
                <p style="margin: 0;">⏳ This code expires in 10 minutes.</p>
                <p style="margin: 10px 0 0 0;">If you didn't request this code, you can safely ignore this email.</p>
              </div>
            </div>

            <div style="
              background-color: #0f172a;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #334155;
            ">
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                © ${new Date().getFullYear()} AlgoViz Platform. All rights reserved.
              </p>
              <div style="margin-top: 15px;">
                <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 13px; margin: 0 10px;">Privacy Policy</a>
                <span style="color: #334155;">|</span>
                <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 13px; margin: 0 10px;">Help Center</a>
              </div>
            </div>
          </div>
          
        </body>
        </html>
      `,
    });
    const check = await User.find({ email });
    console.log(check);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

module.exports.verifyOtp = async (req, res, next) => {
  console.log("verifyOtp me yaha aa rha ha");
  try {
    // await connectDB();
    const { email, otp, name, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Verify OTP
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Update details
    const hashPassword = await User.hashPassword(password);
    user.name = name;
    user.password = hashPassword;
    user.isVerified = true;
    user.authMethod = "email";

    // Clear OTP used (Optional but recommended)
    // user.otp = null;
    // user.otpExpiry = null;
    const sessionId = uuidv4();
    user.currentSessionId = sessionId;
    // 1. Generate Token
    const token = jwt.sign(
      { id: user._id, sessionId: sessionId }, // <--- MUST include sessionId here
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    // --- 1. Generate Token ---
    // const token = await user.generateAuthToken();

    // --- 2. SECURITY UPDATE: Save this token as the ONLY valid session ---
    console.log("Generated token successfully");

    // --- 2. SECURITY UPDATE: Save this token to DB ---
    // This overwrites any previous token, invalidating old sessions
    user.currentSessionToken = token;
    user.lastRotationTime = new Date();
    await user.save({ validateModifiedOnly: true });
    console.log("Session token saved to database");
    res.cookie("token", token, {
      httpOnly: true,
      // 1. "Lax" allows the cookie to be sent between localhost:5173 and localhost:4000
      // "Strict" blocks it because the ports are different!
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

      // 2. "Secure" must be FALSE on localhost (http), TRUE in production (https)
      secure: process.env.NODE_ENV === "production",

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // user.balance = 200

    return res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

module.exports.getUserDetails = async (req, res) => {
  try {
    // await connectDB(); // <--- CONNECT BEFORE QUERYING
    const userId = req.params.id; // Get from URL params, not body

    const user = await User.findById(userId)
      .populate({
        path: "upcomingInterviews",
        options: { sort: { date: 1 } }, // Optional: Sort by nearest date

        // 2. CRITICAL: Deep Populate the Mentor inside the Interview
        // If we don't do this, 'mentorId' will just be an ID string!
        populate: {
          path: "mentorId",
          model: "Mentor", // Ensure this matches your Mentor model name
          select: "name company role avatar", // Only get fields we need
        },
      })
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Invalid user ID" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

module.exports.premiumCheck = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findById({ _id: id });
    return res.status(200).json({ success: true, isPremium: user.isPremium });
  } catch (error) {
    console.log("error : ", error);
    return res.status(500).json({ error: error });
  }
};

module.exports.forgotPassword = async (req, res, next) => {
  // NOTE: Keep your Vercel connection fix
  // await connectDB();

  const { email } = req.body;
  console.log("forgot password triggered for:", email);

  // 1. Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 2. Generate reset token (expires in 10 mins)
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash the token before saving to DB security best practice
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
  await user.save();

  // 3. Construct the Reset URL (Pointing to FRONTEND)
  // Logic: Use Env variable, fallback to localhost for development
  const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendBaseUrl}/reset-password/${resetToken}`;

  console.log("Reset Link Generated:", resetUrl);

  const message = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f9fc; }
      .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden; }
      .email-header { background: #4caf50; color: white; padding: 20px; text-align: center; }
      .email-body { padding: 20px; }
      .email-body p { margin: 0 0 10px; line-height: 1.5; color: #333; }
      .email-footer { text-align: center; padding: 10px; background: #f1f1f1; font-size: 12px; color: #666; }
      .btn { display: inline-block; padding: 10px 20px; background-color: #4caf50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;}
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1>AlgoViz</h1>
      </div>
      <div class="email-body">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
        </p>
        <p style="font-size: 12px; color: #666;">Or copy this link: ${resetUrl}</p>
        <p>This link expires in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
      <div class="email-footer">
        <p>&copy; ${new Date().getFullYear()} AlgoViz. All Rights Reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: message,
    });

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    console.error("Email Error:", err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ message: "Email could not be sent" });
  }
};

// This function actually CHANGES the password
module.exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body; // The new password from frontend

  try {
    // await connectDB();

    // 1. Hash the token to find the user
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Find user with valid token AND ensure time hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    // 3. 🚀 THIS IS THE STEP YOU WANTED: Hash the new password
    // We use the helper method defined in your User model
    user.password = await User.hashPassword(password);

    // 4. Clear the reset token fields (so the link cannot be used again)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // 5. Save the updated user
    await user.save();

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.googleLogin = async (req, res, next) => {
  console.log("Googlre Login Me Aaaya HU");
  try {
    // await connectDB(); // <--- CONNECT BEFORE QUERYING
    const { code } = req.body;
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange authorization code for tokens
    const { tokens } = await client.getToken(code);

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({
      $or: [{ email }, { googleId }],
    });

    if (!user) {
      // Create new user without password
      user = new User({
        name,
        email,
        googleId,
        avatar: picture,
        isVerified: true,
        password: "google_oauth_no_password",
        authMethod: "google",
      });
      await user.save();
    } else {
      // User exists - update Google credentials if needed
      console.log("googleId update");
      if (!user.googleId) {
        console.log("googleId update ho gya");

        user.googleId = googleId;
        user.authMethod = "google";
        await user.save({ validateModifiedOnly: true });
      }
      // Update profile picture if empty
      if (!user.avatar) {
        user.avatar = picture;
        await user.save({ validateModifiedOnly: true });
      }
    }

    // Generate JWT
    // const token = await user.generateAuthToken();
    // user.currentSessionToken = token;
    // await user.save({ validateModifiedOnly: true });

    const sessionId = uuidv4();
    user.currentSessionId = sessionId;
    // 1. Generate Token
    const token = jwt.sign(
      { id: user._id, sessionId: sessionId }, // <--- MUST include sessionId here
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    // const token = await user.generateAuthToken(sessionId);
    console.log("Generated token successfully");

    // --- 2. SECURITY UPDATE: Save this token to DB ---
    // This overwrites any previous token, invalidating old sessions
    user.currentSessionToken = token;
    user.lastRotationTime = new Date();
    await user.save({ validateModifiedOnly: true });
    console.log("Session token saved to database");
    res.cookie("token", token, {
      httpOnly: true,
      // 1. "Lax" allows the cookie to be sent between localhost:5173 and localhost:4000
      // "Strict" blocks it because the ports are different!
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

      // 2. "Secure" must be FALSE on localhost (http), TRUE in production (https)
      secure: process.env.NODE_ENV === "production",

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authMethod: user.authMethod,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
        role: user.role,
        // Include all the fields that email login returns
        questionsSolved: user.questionsSolved || [],
        questionsAttempted: user.questionsAttempted || [],
        credits: user.credits || 0,
        streak: user.streak || 0,
        maxStreak: user.maxStreak || 0,
        memberSince: user.memberSince,
        lastSubmittedDate: user.lastSubmittedDate,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error);
    res.status(400).json({
      message: "Google authentication failed",
      error: error.message,
    });
  }
};

module.exports.updateUserProfile = async (req, res) => {
  console.log("Update profile request:", req.body);
  try {
    // await connectDB(); // <--- CONNECT BEFORE QUERYING

    // Ideally, get ID from the auth token (req.user._id) for security
    // But if you pass it in params, we use that:
    const userId = req.params.id;

    // Destructure ALL possible fields from frontend
    const {
      name,
      avatar,
      bio,
      location,
      website,
      github,
      linkedin,
      skills,
      defaultLanguage,
      theme,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // --- Update Fields (Only if provided in request) ---
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;

    // Socials
    if (website !== undefined) user.website = website;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;

    // Arrays & Preferences
    if (skills) user.skills = skills;
    if (defaultLanguage) user.defaultLanguage = defaultLanguage;
    if (theme) user.theme = theme;

    // Save
    await user.save();

    // Return the updated user (exclude password)
    const updatedUser = user.toObject();
    delete updatedUser.password;
    console.log("yaha tk to aa gya");
    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// module.exports.deductBalance = async (req, res) => {
//   await connectDB(); // <--- CONNECT BEFORE QUERYING
//   const cost = req.body.amount; // Cost to deduct
//   const userId = req.user._id; // Assuming user ID is in req.user from auth middleware
//   let response = {
//     success: false,
//     message: "",
//     balance: req.user.balance,
//   };

//   if (!userId) {
//     response.message = "User not found";
//     console.log("User not found for ID:", userId);
//     return res.status(200).json(response);
//   }

//   if (!cost || cost <= 0) {
//     response.message = "Invalid cost amount, your balance is unchanged";
//     console.log("Invalid cost amount:", cost);
//     return res.status(200).json(response);
//   }

//   if (req.user.balance < cost) {
//     response.message = "Insufficient balance, your balance is unchanged";
//     console.log("Insufficient balance:", user.balance, "<", cost);
//     return res.status(200).json(response);
//   }

//   const user = req.user;
//   user.balance -= cost;
//   try {
//     await user.save();
//     response.balance = user.balance;
//     response.message =
//       "balance deducted successfully, new balance: " + user.balance;
//     response.success = true;
//     console.log(response);
//   } catch (error) {
//     response.message = "Error processing balance, your balance is unchanged.";
//     response.success = false;
//     console.error("Error deducting credits:", error);
//   } finally {
//     res.status(200).json(response);
//   }
// };

module.exports.deductBalance = async (req, res) => {
  try {
    // await connectDB();
    // 1. Get all 3 required fields
    const { amount, itemId, questionId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user.balance < amount) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    // 2. DEDUCT MONEY
    user.balance -= amount;

    // 3. SAVE THE PURCHASE (The part you are likely missing)
    if (questionId && itemId) {
      // Find if this question already has some unlocked items
      const existingEntry = user.unlockedContent.find(
        (u) => u.questionId.toString() === questionId
      );

      if (existingEntry) {
        // If question exists, just add the new item (e.g., add "hint2")
        if (!existingEntry.unlockedItems.includes(itemId)) {
          existingEntry.unlockedItems.push(itemId);
        }
      } else {
        // If question is new, create a new entry
        user.unlockedContent.push({
          questionId: questionId,
          unlockedItems: [itemId],
        });
      }
    } else {
      // Safety Check: If we can't save the item, DO NOT deduct money.
      return res.status(400).json({
        success: false,
        message: "Error: Missing questionId. Purchase cancelled.",
      });
    }

    // 4. Save everything to DB
    await user.save();

    res.status(200).json({
      success: true,
      balance: user.balance,
      message: "Unlocked and Saved",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Transaction failed" });
  }
};
module.exports.getAllNotification = async (req, res) => {
  try {
    // await connectDB();
    const notifications = await Notification.find({
      recipient: req.user.id,
    }).sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ success: true, notifications: notifications });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

module.exports.markAllNotificationsRead = async (req, res) => {
  try {
    // await connectDB();
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res
      .status(200)
      .json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    console.error("Mark Read Error:", error);
    res.status(500).send("Server Error");
  }
};

module.exports.markNotificationRead = async (req, res) => {
  try {
    // await connectDB();
    const notificationId = req.params.id;

    // Security Check: ensure the notification actually belongs to the user requesting it
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user._id }, // Filter
      { $set: { isRead: true } }, // Update
      { new: true } // Return updated doc
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized",
      });
    }

    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("Error marking notification read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.countUnReadNotification = async (req, res) => {
  try {
    // await connectDB();
    const notification = Notification.find({
      recipient: req.user._id,
      isRead: false,
    });
    res.status(200).json({ success: true, count: (await notification).length });
  } catch (error) {
    console.error("Error marking notification read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.rotateSession = async (req, res) => {
  try {
    // await connectDB();
    const user = req.user; // Middleware already attached user
    const ROTATION_COOLDOWN = 60 * 1000; // 60 Seconds (1 Minute)
    console.log("rotate krne aaye hai");
    const currentTime = new Date();
    const lastRotation = new Date(user.lastRotationTime || 0);

    // 1. CHECK: Is it too soon to rotate?
    if (currentTime - lastRotation < ROTATION_COOLDOWN) {
      console.log("Too soon to rotate. Returning existing token.");

      // DO NOT create new ID. DO NOT update DB.
      // Just return the token they already sent us (it's still valid).
      const currentToken = req.headers.authorization?.split(" ")[1];

      return res.status(200).json({
        success: true,
        token: currentToken,
        user: user,
        message: "Session is fresh",
      });
    }

    // 2. IF TIME IS UP -> ROTATE (Logic remains same)
    const newSessionId = uuidv4();

    // Update DB with new ID and Time
    await User.findByIdAndUpdate(user._id, {
      currentSessionId: newSessionId,
      lastRotationTime: currentTime,
    });

    const newToken = jwt.sign(
      { id: user._id, sessionId: newSessionId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set Cookie & Header
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      token: newToken,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Rotation failed" });
  }
};

// Refresh Token Endpoint - Issues new access token if current one is valid
module.exports.refreshToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Validate session ID (maintains single-session security)
    if (!decoded.sessionId || decoded.sessionId !== user.currentSessionId) {
      return res.status(401).json({
        success: false,
        message: "Session expired. You may have logged in from another device."
      });
    }

    // Issue fresh token with same sessionId (maintains single-session)
    const newToken = jwt.sign(
      { id: user._id, sessionId: user.currentSessionId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      token: newToken,
      accessToken: newToken, // Frontend checks both
      user: user,
    });

  } catch (error) {
    console.log("Refresh token error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports.getUnlockStatus = async (req, res) => {
  try {
    // await connectDB();
    const { questionId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Premium Users: Return a "Wildcard" or handle on frontend
    // But for consistency, let's just tell frontend "Everything is true" logic
    if (user.isPremium) {
      // We can return a special flag, or the frontend already handles isPremium check.
      // Sending empty object + isPremium flag is enough usually.
      return res.status(200).json({ success: true, isPremium: true });
    }

    // 2. Find the entry for this question
    // Ensure we match String IDs
    const entry = user.unlockedContent.find(
      (item) => String(item.questionId) === String(questionId)
    );

    // 3. DYNAMIC MAP (The Fix)
    // Convert array ["hint1", "solution", "hint4"] -> { hint1: true, solution: true, hint4: true }
    const statusMap = {};

    if (entry && entry.unlockedItems) {
      entry.unlockedItems.forEach((item) => {
        statusMap[item] = true;
      });
    }

    // Now 'statusMap' contains exactly what is unlocked, no matter how many hints exist.
    res.status(200).json({ success: true, unlockedItems: statusMap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports.getInterviewHistory = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1. QUERY: Filter for strictly "History" items
    // We exclude "Scheduled" or "Pending" because they belong in the "Upcoming" column
    const query = {
      studentId: studentId,
      status: { $in: ["Completed", "Cancelled"] }, // <--- THE FIX
    };

    // 2. FETCH
    const interviews = await Interview.find(query)
      .populate("mentorId", "name avatar company") // Get mentor details
      .sort({ date: -1 }); // Newest past sessions first

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Fetch History Error:", error);
    res.status(500).json({ message: "Failed to fetch interview history" });
  }
};

// ============ GET UPCOMING INTERVIEWS (STUDENT) ============
module.exports.getUpcomingInterviews = async (req, res) => {
  try {
    // await connectDB();
    const studentId = req.user._id;

    // Fetch only scheduled (upcoming) interviews
    const interviews = await Interview.find({
      studentId: studentId,
      status: "Scheduled",
    })
      .populate("mentorId", "name avatar company role expertise")
      .sort({ date: 1 }); // Soonest first

    // Format response with helpful flags
    const formattedInterviews = interviews.map((interview) => {
      const hasLinks =
        interview.meetingLink && interview.meetingLink.trim() !== "";

      return {
        _id: interview._id,
        topic: interview.topic,
        date: interview.date,
        timeSlot: interview.timeSlot,
        status: interview.status,
        meetingLink: interview.meetingLink,
        googleDocLink: interview.googleDocLink,
        resume: interview.resume,
        mentor: interview.mentorId
          ? {
            _id: interview.mentorId._id,
            name: interview.mentorId.name,
            company: interview.mentorId.company,
            role: interview.mentorId.role,
            avatar: interview.mentorId.avatar,
            expertise: interview.mentorId.expertise,
          }
          : null,
        hasLinks,
        waitingForLinks: !hasLinks,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedInterviews.length,
      interviews: formattedInterviews,
    });
  } catch (error) {
    console.error("Fetch Upcoming Interviews Error:", error);
    res.status(500).json({ message: "Failed to fetch upcoming interviews" });
  }
};

// ============ GET SINGLE INTERVIEW BY ID (FOR RESULT PAGE) ============
module.exports.getInterviewById = async (req, res) => {
  try {
    // await connectDB();
    const { id } = req.params;

    const interview = await Interview.findById(id)
      .populate("mentorId", "name avatar company role expertise")
      .populate("studentId", "name avatar");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    // Format response
    const formattedInterview = {
      _id: interview._id,
      title: interview.topic || "Mock Interview",
      date: interview.date,
      timeSlot: interview.timeSlot,
      duration: interview.duration || 45,
      status: interview.status,
      meetingLink: interview.meetingLink,
      googleDocLink: interview.googleDocLink,
      resume: interview.resume,
      amount: interview.amount,
      mentor: interview.mentorId ? {
        _id: interview.mentorId._id,
        name: interview.mentorId.name,
        company: interview.mentorId.company,
        role: interview.mentorId.role,
        avatar: interview.mentorId.avatar,
        expertise: interview.mentorId.expertise,
      } : null,
      student: interview.studentId ? {
        _id: interview.studentId._id,
        name: interview.studentId.name,
        avatar: interview.studentId.avatar,
      } : null,
      // Mentor Feedback (main feedback data)
      mentorFeedback: interview.mentorFeedback || null,
      // Student's review of the mentor
      studentFeedback: interview.studentFeedback || null,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    };

    res.status(200).json({
      success: true,
      interview: formattedInterview,
    });
  } catch (error) {
    console.error("Get Interview By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview details"
    });
  }
};

module.exports.redeemReward = async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cost = 0;
    let rewardName = "";

    if (itemId === "premium_1mo") {
      cost = 500;
      rewardName = "1 Month Premium";
    } else if (itemId === "interview_2") {
      cost = 200;
      rewardName = "2 Mock Interviews";
    } else {
      return res.status(400).json({ success: false, message: "Invalid Item ID" });
    }

    if ((user.balance || 0) < cost) {
      return res.status(400).json({ success: false, message: `Insufficient Points. Need ${cost} pts.` });
    }

    // Deduct Balance
    user.balance -= cost;

    // Grant Reward
    if (itemId === "premium_1mo") {
      const currentExpiry =
        user.premiumExpiryDate && new Date(user.premiumExpiryDate) > new Date()
          ? new Date(user.premiumExpiryDate)
          : new Date();
      currentExpiry.setDate(currentExpiry.getDate() + 30);
      user.premiumExpiryDate = currentExpiry;
      user.isPremium = true;
    } else if (itemId === "interview_2") {
      user.freeInterviews = (user.freeInterviews || 0) + 2;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Redeemed ${rewardName} successfully!`,
      user: {
        balance: user.balance,
        isPremium: user.isPremium,
        premiumExpiryDate: user.premiumExpiryDate,
        freeInterviews: user.freeInterviews,
      },
      newBalance: user.balance
    });
  } catch (error) {
    console.error("Redeem Reward Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports.getLeaderboard = async (req, res) => {
  try {
    // Aggregation Pipeline for efficient scoring and sorting
    const leaderboard = await User.aggregate([
      {
        $project: {
          name: 1,
          avatar: 1,
          username: 1, 
          isPremium: 1,
          streak: 1,
          questionsSolvedCount: { $size: { $ifNull: ["$questionsSolved", []] } },
          mcqCorrectCount: { $ifNull: ["$mcqProgress.correctAnswers", 0] },
          // Total Score Calculation
          // DSA = 10 pts, MCQ = 5 pts, Streak = 2 pts
          totalScore: {
            $add: [
              { $multiply: [{ $size: { $ifNull: ["$questionsSolved", []] } }, 10] },
              { $multiply: [{ $ifNull: ["$mcqProgress.correctAnswers", 0] }, 5] },
              { $multiply: [{ $ifNull: ["$streak", 0] }, 2] }
            ]
          }
        }
      },
      { $sort: { totalScore: -1 } }, // Sort by highest score first
      { $limit: 50 } // Top 50 users
    ]);

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

