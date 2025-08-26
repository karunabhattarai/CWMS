// websocket.js
const { Server } = require("socket.io");
import dotenv from "dotenv";
dotenv.config();
let io;

function initWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL, 
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    // Optionally join room based on userId
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { initWebSocket, getIO };
