// This file sets up the connection to MongoDB using Mongoose.

// so had the dotenv package to load environment variables from a .env file
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
// Importing routes
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import subtaskTemplateRoutes from './routes/subtaskTemplateRoutes.js';
import taskTemplateRoutes from './routes/taskTemplateRoutes.js';


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
app.use(express.json()); // Middleware to parse JSON bodies

// Routes
app.use('/api/user', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/subtask-template', subtaskTemplateRoutes);
app.use('/api/task-template', taskTemplateRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
