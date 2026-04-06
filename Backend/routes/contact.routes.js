const express = require("express");
const router = express.Router();
const {
  submitContactForm,
  getMyTickets,
  userReply,
} = require("../controllers/contact.controller");
const { authUser } = require("../middlewares/auth");
// Public Route: Submit Contact Form
router.post("/createQuery", submitContactForm);
router.get("/my-tickets", authUser, getMyTickets);

router.post("/user-reply", authUser, userReply);
module.exports = router;
