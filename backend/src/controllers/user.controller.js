const mongoose = require("mongoose");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ImageKit = require("@imagekit/nodejs");

// Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" },
  );
};

// Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  });
};

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { username, name, email, password, role } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({
        message: "Username, name, email and password are required",
      });
    }

    // basic validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    const user = new User({ username, name, email, password, role });
    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({
      message: "Error registering user",
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username && !email) {
      return res.status(400).json({
        message: "Username or email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid username/email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid username/email or password",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 🔥 hash refresh token before saving
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedToken;

    // update last login (if you add field)
    user.lastLogin = new Date();

    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({
      message: "Error logging in user",
    });
  }
};


// ================= LOGOUT =================
const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error logging out user:", error);
    return res.status(500).json({
      message: "Error logging out user",
    });
  }
};


// ================== Refresh Token Endpoint (Optional) ==================

const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    const user = await User.findOne({ refreshToken: token });
    if (!user) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    const accessToken = generateAccessToken(user);
    return res.status(200).json({
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({
      message: "Error refreshing token",
    });
  }
};

// ================= GET PROFILE =================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User profile fetched successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      message: "Error fetching user profile",
    });
  }
};

// ================= UPDATE BASIC =================
async function updateBasicProfile(req, res) {
  try {
    const { name, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let changed = false;

    if (name && typeof name === "string") {
      user.name = name;
      changed = true;
    }

    if (password) {
      if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }
      user.password = password;
      changed = true;
    }

    if (!changed) {
      return res.status(400).json({
        message: "No valid fields provided to update",
      });
    }

    await user.save();

    const safeUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    return res.status(200).json({
      message: "Profile updated",
      data: { user: safeUser },
    });
  } catch (error) {
    console.error("Error updating basic profile:", error);
    return res.status(500).json({
      message: "Error updating profile",
    });
  }
}

// ================= UPDATE SOCIAL =================
async function updateSocial(req, res) {
  try {
    const { github, linkedin } = req.body;

    if (github === undefined && linkedin === undefined) {
      return res.status(400).json({
        message: "At least one social field must be provided",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let changed = false;

    if (typeof github === "string") {
      user.github = github;
      changed = true;
    }

    if (typeof linkedin === "string") {
      user.linkedin = linkedin;
      changed = true;
    }

    if (!changed) {
      return res.status(400).json({
        message: "No valid social fields provided",
      });
    }

    await user.save();

    const safeUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    return res.status(200).json({
      message: "Social links updated",
      data: { user: safeUser },
    });
  } catch (error) {
    console.error("Error updating social links:", error);
    return res.status(500).json({
      message: "Error updating social links",
    });
  }
}

// ================= UPDATE EXTRAS =================
async function updateProfileExtras(req, res) {
  try {
    const { bio } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let changed = false;

    if (typeof bio === "string") {
      user.bio = bio;
      changed = true;
    }

    if (req.file && req.file.buffer) {
      const imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      });

      const base64File = req.file.buffer.toString("base64");

      const uploadResult = await imagekit.files.upload({
        file: base64File,
        fileName: req.file.originalname,
        folder: "/avatar",
        useUniqueFileName: true,
      });

      if (uploadResult?.url) {
        user.avatar = uploadResult.url;
        changed = true;
      }
    }

    if (!changed) {
      return res.status(400).json({
        message: "No fields provided to update",
      });
    }

    await user.save();

    const safeUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    return res.status(200).json({
      message: "Profile updated",
      data: { user: safeUser },
    });
  } catch (error) {
    console.error("Error updating profile extras:", error);
    return res.status(500).json({
      message: "Error updating profile",
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateBasicProfile,
  updateSocial,
  updateProfileExtras,
  refreshToken,
};
