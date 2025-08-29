import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    // Replace with your backend websocket URL
    const URL = import.meta.env.VITE_BACKEND_WS_URL || "http://localhost:5000";
    socket = io(URL, {
      autoConnect: true,
      transports: ["websocket"],
      withCredentials: true,
    });
  }
  return socket;
}
