const Resume = require("../models/resume.model");
const { uploadToImageKit } = require("../services/upload.service");
const { parseResume } = require("../services/resumeParser.service");
const { extractStructuredData } = require("../services/aiResume.service");

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    // 1. Upload to ImageKit
    const resumeUrl = await uploadToImageKit(req.file);

    // 2. Extract text
    const rawText = await parseResume(req.file.buffer);

    // 3. AI structuring
    const structuredData = await extractStructuredData(rawText);

    // 4. Save in DB
    const resume = await Resume.create({
      userId: req.user.id,
      resumeUrl,
      rawText,
      structuredData,
    });

    return res.status(201).json({
      message: "Resume uploaded and processed",
      data: { resume },
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return res.status(500).json({
      message: "Error processing resume",
    });
  }
};

const updateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    // 1. Upload to ImageKit
    const resumeUrl = await uploadToImageKit(req.file);

    // 2. Extract text
    const rawText = await parseResume(req.file.buffer);

    // 3. AI structuring
    const structuredData = await extractStructuredData(rawText);

    // 4. Find latest resume for user
    const existing = await Resume.findOne({ userId: req.user.id }).sort({ createdAt: -1 });

    if (existing) {
      existing.resumeUrl = resumeUrl;
      existing.rawText = rawText;
      existing.structuredData = structuredData;
      await existing.save();
      // Also update user's skills based on structuredData.skills
      if (structuredData && Array.isArray(structuredData.skills)) {
        const User = require('../models/user.model');
        const user = await User.findById(req.user.id);
        if (user) {
          user.skills = Array.from(new Set([...structuredData.skills]));
          await user.save();
        }
      }

      return res.status(200).json({ message: 'Resume updated', data: { resume: existing } });
    }

    // If no existing resume, create a new one (same as upload)
    const resume = await Resume.create({
      userId: req.user.id,
      resumeUrl,
      rawText,
      structuredData,
    });

    // update user skills as well
    if (structuredData && Array.isArray(structuredData.skills)) {
      const User = require('../models/user.model');
      const user = await User.findById(req.user.id);
      if (user) {
        user.skills = Array.from(new Set([...(user.skills || []), ...structuredData.skills]));
        await user.save();
      }
    }

    return res.status(201).json({
      message: "Resume uploaded and processed",
      data: { resume },
    });
  } catch (error) {
    console.error("Resume update error:", error);
    return res.status(500).json({
      message: "Error processing resume",
    });
  }
};


const getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    if (!resume) {
      return res.status(200).json({
        message: "No resume found",
        data: { resume: null },
      });
    }

    return res.status(200).json({
      message: "Resume fetched",
      data: { resume },
    });
  } catch (error) {
    console.error("Get resume error:", error);
    return res.status(500).json({
      message: "Error fetching resume",
    });
  }
};

module.exports = { uploadResume, updateResume, getMyResume };
