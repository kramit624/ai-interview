const express = require('express');
const app = express();
const cors = require('cors');

const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/user.routes');
const bookingRoutes = require("./routes/booking.routes");
const resumeRoutes = require("./routes/resume.routes");
const aiTestRoutes = require("./routes/aiTest.routes");
const liveInterviewRoutes = require("./routes/liveInterview.routes");

app.use(
  cors({
    origin: "http://localhost:5173", // React app URL
    credentials: true, // Allow cookies to be sent
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1', bookingRoutes);
app.use('/api/v1', resumeRoutes);
app.use("/api/v1/aiTest", aiTestRoutes);
app.use('/api/v1/live_interview', liveInterviewRoutes);

module.exports = app;