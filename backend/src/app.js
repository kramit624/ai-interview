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
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["set-cookie"], // add this
  }),
);


app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1', bookingRoutes);
app.use('/api/v1', resumeRoutes);
app.use("/api/v1/aiTest", aiTestRoutes);
app.use('/api/v1/live_interview', liveInterviewRoutes);
app.get('/', (req, res) => {
  res.send('Welcome to the AI Interview Platform API');
});

module.exports = app;