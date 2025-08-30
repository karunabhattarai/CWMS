import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    // Replace with your backend websocket URL
    const URL = `${import.meta.env.VITE_API_BASE_URL}`;
    socket = io(URL, {
      autoConnect: true,
      transports: ["websocket"],
      withCredentials: true,
    });
  }
  return socket;
}
