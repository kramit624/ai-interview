const mongoose = require("mongoose");
const Availability = require("../models/availability.model");
const Booking = require("../models/booking.model");

// helper
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const bookSlot = async (req, res) => {
  try {
    const { developerId, date, startTime, endTime } = req.body;

    if (!developerId || !date || !startTime || !endTime) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 🔥 convert developerId → ObjectId
    const devId = new mongoose.Types.ObjectId(developerId);

    // 🔥 TIME VALIDATION
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (start < 8 * 60 || end > 22 * 60) {
      return res.status(400).json({
        message: "Booking allowed only between 08:00 and 22:00",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "Invalid time range",
      });
    }

    // 🔥 normalize date
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        message: "Cannot book past dates",
      });
    }

    // 🔥 CHECK AVAILABILITY FIRST (IMPORTANT)
    const availability = await Availability.findOne({
      developerId: devId,
      date: selectedDate,
    });

    if (!availability) {
      return res.status(404).json({
        message: "No availability found for this developer on this date",
      });
    }

    // 🔥 ATOMIC SLOT LOCK
    const updatedAvailability = await Availability.findOneAndUpdate(
      {
        developerId: devId,
        date: selectedDate,
        "slots.startTime": startTime,
        "slots.isBooked": false,
      },
      {
        $set: {
          "slots.$.isBooked": true,
        },
      },
      { new: true },
    );

    if (!updatedAvailability) {
      return res.status(400).json({
        message: "Slot already booked or not available",
      });
    }

    // ✅ create booking
    const booking = await Booking.create({
      fresherId: req.user.id,
      developerId: devId,
      date: selectedDate,
      startTime,
      endTime,
    });

    return res.status(201).json({
      message: "Booking confirmed",
      data: { booking },
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({
      message: "Error booking slot",
    });
  }
};


// ================== Cancel booking (optional) ==================

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const isFresher = booking.fresherId.toString() === req.user.id;
    const isDeveloper = booking.developerId.toString() === req.user.id;

    if (!isFresher && !isDeveloper) {
      return res.status(403).json({
        message: "Unauthorized to cancel this booking",
      });
    }

    // 🔥 already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking already cancelled",
      });
    }

    // 🔥 find availability
    const availability = await Availability.findOne({
      developerId: booking.developerId,
      date: booking.date,
    });

    if (!availability) {
      return res.status(404).json({
        message: "Availability not found",
      });
    }

    // 🔥 find slot & release it
    const slot = availability.slots.find(
      (s) => s.startTime === booking.startTime,
    );

    if (slot) {
      slot.isBooked = false;
      await availability.save();
    }

    // 🔥 update booking status
    booking.status = "cancelled";
    booking.cancelledBy = isFresher ? "fresher" : "developer";
    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({
      message: "Error cancelling booking",
    });
  }
};



// ================= GET MY BOOKINGS =================
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      fresherId: req.user.id,
    }).populate("developerId", "name username");

    return res.status(200).json({
      message: "Bookings fetched successfully",
      data: { bookings },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return res.status(500).json({
      message: "Error fetching bookings",
    });
  }
};




module.exports = {
  bookSlot,
  getMyBookings,
  cancelBooking
};
