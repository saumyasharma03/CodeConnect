let io = null;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, { cors: { origin: "*" } });
    return io;
  },
  emit: (...args) => io && io.emit(...args),
  getIO: () => io
};
