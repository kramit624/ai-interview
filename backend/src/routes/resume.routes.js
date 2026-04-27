const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/uploadImage.middleware");

const { uploadResume, updateResume, getMyResume } = require("../controllers/resume.controller");
const rateLimit = require('../middlewares/rateLimit.middleware');

// Allow max 2 uploads per minute per user
const uploadLimiter = rateLimit({ maxRequests: 2, windowMs: 60 * 1000 });

router.get("/resume/mine", authMiddleware, getMyResume);


router.post(
  "/resume/upload",
  authMiddleware,
  uploadLimiter,
  upload.single("resume"),
  uploadResume,
);

// Update existing resume (same pipeline) - also rate limited
router.put(
  "/resume/upload",
  authMiddleware,
  uploadLimiter,
  upload.single("resume"),
  updateResume,
);

module.exports = router;
