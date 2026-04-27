const Availability = require("../models/availability.model");

// 🔥 helpers
const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
};

// ================= CREATE AVAILABILITY =================
const createAvailability = async (req, res) => {
  try {
    const { date, slots } = req.body;

    if (!date || !slots || !Array.isArray(slots)) {
      return res.status(400).json({
        message: "Date and slots are required",
      });
    }

    if (slots.length === 0) {
      return res.status(400).json({
        message: "At least one slot is required",
      });
    }

    // 🔥 limit per request (hybrid support)
    if (slots.length > 5) {
      return res.status(400).json({
        message: "You can create maximum 5 slots at once",
      });
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // 🔥 prevent past date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        message: "Cannot create availability for past dates",
      });
    }

    const now = new Date();

    // 🔥 get existing availability
    const existingAvailability = await Availability.findOne({
      developerId: req.user.id,
      date: selectedDate,
    });

    let existingSlots = existingAvailability?.slots || [];

    // 🔥 max 5 slots per day
    const totalSlotsAfter = existingSlots.length + slots.length;

    if (totalSlotsAfter > 5) {
      return res.status(400).json({
        message: `Maximum 5 slots allowed per day. You already have ${existingSlots.length}`,
      });
    }

    const newSlots = [];

    for (let slot of slots) {
      if (!slot.startTime) {
        return res.status(400).json({
          message: "startTime is required",
        });
      }

      const startTime = slot.startTime;
      const startMinutes = timeToMinutes(startTime);

      // 🔥 auto endTime = +1 hour
      const endMinutes = startMinutes + 60;
      const endTime = minutesToTime(endMinutes);

      // 🔥 prevent past time (only if today)
      const [hours, minutes] = startTime.split(":").map(Number);
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hours, minutes, 0, 0);

      if (slotTime < now) {
        return res.status(400).json({
          message: "Cannot create slot in past time",
        });
      }

      // 🔥 duplicate check inside request
      if (newSlots.some((s) => s.startTime === startTime)) {
        return res.status(400).json({
          message: "Duplicate slot in request",
        });
      }

      // 🔥 duplicate check with DB
      if (existingSlots.some((s) => s.startTime === startTime)) {
        return res.status(400).json({
          message: "Slot already exists for this time",
        });
      }

      // 🔥 2-hour gap validation
      const allSlots = [...existingSlots, ...newSlots];

      for (let existing of allSlots) {
        const existingStart = timeToMinutes(existing.startTime);

        // block 3 hours (1hr slot + 2hr gap)
        const blockedStart = existingStart;
        const blockedEnd = existingStart + 180;

        if (startMinutes >= blockedStart && startMinutes < blockedEnd) {
          return res.status(400).json({
            message: "Slot conflict: maintain 2-hour gap between slots",
          });
        }
      }

      newSlots.push({
        startTime,
        endTime,
      });
    }

    let availability;

    // 🔥 append or create
    if (existingAvailability) {
      existingAvailability.slots.push(...newSlots);
      availability = await existingAvailability.save();
    } else {
      availability = await Availability.create({
        developerId: req.user.id,
        date: selectedDate,
        slots: newSlots,
      });
    }

    return res.status(201).json({
      message: "Availability created successfully",
      data: { availability },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Availability already exists for this date",
      });
    }

    console.error("Create availability error:", error);
    return res.status(500).json({
      message: "Error creating availability",
    });
  }
};

// ================= GET AVAILABILITY =================
const getAvailability = async (req, res) => {
  try {
    const { developerId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availability = await Availability.find({
      developerId,
      date: { $gte: today },
    });

    return res.status(200).json({
      message: "Availability fetched successfully",
      data: { availability },
    });
  } catch (error) {
    console.error("Get availability error:", error);
    return res.status(500).json({
      message: "Error fetching availability",
    });
  }
};

module.exports = {
  createAvailability,
  getAvailability,
};
