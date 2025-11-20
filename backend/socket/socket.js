// socket-server.js
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New socket connected:", socket.id);

    // -------------------------
    // User joins a room
    // -------------------------
    socket.on("join-room", ({ roomId, username }) => {
      socket.join(roomId);
      socket.username = username || "Guest";
      socket.roomId = roomId;

      // broadcast updated users count
      const clients = io.sockets.adapter.rooms.get(roomId) || new Set();
      io.to(roomId).emit("users-update", clients.size);

      // notify others that a new user joined
      socket.to(roomId).emit("user-joined", {
        userId: socket.id,
        username: socket.username,
      });

      console.log(`${socket.username} joined room ${roomId}`);
    });

    // -------------------------
    // Cursor movement / selection
    // -------------------------
    socket.on("cursor-move", ({ roomId, position, selection, username }) => {
      socket.to(roomId).emit("cursor-update", {
        userId: socket.id,
        username: username || socket.username,
        position,
        selection,
        timestamp: Date.now(),
      });
    });

    // -------------------------
    // User leaves room explicitly
    // -------------------------
    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);
      const clients = io.sockets.adapter.rooms.get(roomId) || new Set();
      io.to(roomId).emit("users-update", clients.size);
      socket.to(roomId).emit("user-left", { userId: socket.id });
      console.log(`${socket.username} left room ${roomId}`);
    });

    // -------------------------
    // Handle disconnect
    // -------------------------
    socket.on("disconnect", () => {
      const roomId = socket.roomId;
      if (roomId) {
        const clients = io.sockets.adapter.rooms.get(roomId) || new Set();
        io.to(roomId).emit("users-update", clients.size);
        socket.to(roomId).emit("user-left", { userId: socket.id });
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
};
