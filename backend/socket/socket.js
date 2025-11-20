module.exports = (io) => {
  // roomId -> Map(userId -> username)
  const roomUsers = {};

  io.on("connection", (socket) => {
    console.log("New socket connected:", socket.id);

    socket.on("join-room", ({ roomId, username }) => {
      socket.join(roomId);
      socket.username = username || "Guest";
      socket.roomId = roomId;

      if (!roomUsers[roomId]) roomUsers[roomId] = new Map();
      roomUsers[roomId].set(socket.id, socket.username);

      // broadcast user list
      const userList = Array.from(roomUsers[roomId], ([userId, username]) => ({
        userId,
        username,
      }));
      // console.log(userList);
      io.to(roomId).emit("users-list", userList);
      console.log("userslist: ");
      console.log(`${socket.username} joined room ${roomId}`);
    });

    socket.on("leave-room", ({ roomId }) => {
      if (roomUsers[roomId]) {
        roomUsers[roomId].delete(socket.id);
      }
      const userList = Array.from(roomUsers[roomId] || [], ([userId, username]) => ({
        userId,
        username,
      }));
      io.to(roomId).emit("users-list", userList);

      socket.leave(roomId);
      console.log(`${socket.username} left room ${roomId}`);
    });

    socket.on("disconnect", () => {
      const roomId = socket.roomId;
      if (roomId && roomUsers[roomId]) {
        roomUsers[roomId].delete(socket.id);
        const userList = Array.from(roomUsers[roomId], ([userId, username]) => ({
          userId,
          username,
        }));
        io.to(roomId).emit("users-list", userList);
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
};
