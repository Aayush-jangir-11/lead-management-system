const express = require("express");
const router = express.Router();
const {
  verifyWebhook,
  handleWebhook,
} = require("../controllers/facebookWebhookController");

// GET /api/webhooks/facebook (Handshake Verification)
router.get("/facebook", verifyWebhook);

// POST /api/webhooks/facebook (Lead Event Receiver)
router.post("/facebook", handleWebhook);

module.exports = router;
