// backend/server.js
// This file sets up the connection to MongoDB using Mongoose.

// so had the dotenv package to load environment variables from a .env file
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config(); 

// require('dotenv').config(); // "type": "module" yo rakhexa package.jsonma

// const mongoose = require('mongoose');

mongoose.connect(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));
