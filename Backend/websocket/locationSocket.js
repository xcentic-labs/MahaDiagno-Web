// socket.js
import { Server } from "socket.io";

export function initSocket(server) {
  const io = new Server(server, {
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

// console.log("Local Time:", localTime);
      console.log({ userId,userName ,latitude, longitude , localTime  });
      io.emit('tracklocation', { userId, userName ,latitude, longitude });
    });


    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
    });

  });

  return io;
}
