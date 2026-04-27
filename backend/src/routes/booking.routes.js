const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  createAvailability,
  getAvailability,
} = require("../controllers/availability.controller");

const {
  bookSlot,
  getMyBookings,
  cancelBooking,
} = require("../controllers/booking.controller");

// ================= AVAILABILITY ROUTES =================

// 🔒 Only developers can create availability
router.post(
  "/availability",
  authMiddleware,
  roleMiddleware("developer"),
  createAvailability,
);


// 🌍 Public route (anyone can see slots)
router.get("/availability/:developerId", getAvailability);

// ================= BOOKING ROUTES =================


// 🔒 Only freshers can book
router.post("/booking", authMiddleware, roleMiddleware("fresher"), bookSlot);

// User can cancel their booking
router.put("/booking/:bookingId/cancel", authMiddleware, cancelBooking);

// 🔒 Logged-in user bookings
router.get("/booking/my", authMiddleware, getMyBookings);

module.exports = router;
