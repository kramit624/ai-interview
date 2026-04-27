const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
  startLiveInterview,
  sendMessage,
  endInterview,
  getInterviewHistory,
  getLiveInterviewById,
} = require("../controllers/liveInterview.controller");

router.post("/start", authMiddleware, startLiveInterview);
router.post("/:id/message", authMiddleware, sendMessage);
router.post("/:id/end", authMiddleware, endInterview);
router.get("/history", authMiddleware, getInterviewHistory);
router.get("/:id", authMiddleware, getLiveInterviewById);

module.exports = router;
