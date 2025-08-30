// This file sets up the connection to MongoDB using Mongoose.

// so had the dotenv package to load environment variables from a .env file
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
// Importing routes
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import companyRoutes from "./routes/companyRoutes.js";
import subtaskTemplateRoutes from './routes/subtaskTemplateRoutes.js';
import taskTemplateRoutes from './routes/taskTemplateRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import subtaskRoutes from './routes/subtaskRoutes.js';
import schedulingRoutes from './routes/schedulingRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import http from "http";
import { initWebSocket } from "./utils/websocket.js";

import alertRoutes from './routes/alertRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import deadlineRoutes from './routes/deadlineRoutes.js';
import dynamicCronService from './services/cronService.js';

import cors from "cors";
dotenv.config();

// require('dotenv').config(); // "type": "module" yo rakhexa package.jsonma
// const mongoose = require('mongoose');

mongoose
  .connect(process.env.URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Increase payload limits for file uploads (base64 encoded files can be large)
app.use(express.json({ limit: '50mb' })); // Increased from default 100kb to 50mb
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Also increase URL encoded limit

// Routes
app.use('/api/user', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/subtask-template', subtaskTemplateRoutes);
app.use('/api/task-template', taskTemplateRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/subtask', subtaskRoutes);
app.use('/api/schedule', schedulingRoutes);
app.use('/api/alert', alertRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/deadline', deadlineRoutes);
app.use("/api/employee", employeeRoutes);

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize WebSocket server
initWebSocket(server);

// Initialize Dynamic Cron Service after database connection
dynamicCronService.initialize();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
