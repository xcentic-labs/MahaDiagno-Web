// socket.js
import { Server } from "socket.io";

export function initSocket(server) {
  const io = new Server(server, {
    // other upgrades (e.g. /api/v1/ai/voice-agent) are handled by websocket/aiVoiceAgent.js
    destroyUpgrade: false,
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('sendLocation', ({ userId,userName , latitude, longitude }) => {
      const now = new Date();
      const localTime = now.toLocaleTimeString();

      io.emit('tracklocation', { userId, userName ,latitude, longitude });
    });


    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
    });

  });

  return io;
}
