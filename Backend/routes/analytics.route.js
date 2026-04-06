const express = require("express");
const router = express.Router();
const { recordVisit } = require("../controllers/analytics.controller");

router.post("/visit", recordVisit);

module.exports = router;
