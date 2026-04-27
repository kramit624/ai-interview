const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
  startTest,
  submitTestAnswer,
  getTestHistory,
  getTestAnalytics,
  getTestById,
} = require("../controllers/aiTest.controller");

router.post("/start", authMiddleware, startTest);
router.post("/:id/answer", authMiddleware, submitTestAnswer);
router.get("/history", authMiddleware, getTestHistory);
router.get("/analytics", authMiddleware, getTestAnalytics);
router.get("/:id", authMiddleware, getTestById);

module.exports = router;
