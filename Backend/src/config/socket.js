const { Server } = require("socket.io");

let io = null;

module.exports = {
    // Call this once in server.js
    init: (httpServer, options) => {
        io = new Server(httpServer, options);
        return io;
    },

    // Call this anywhere
    getIO: () => {
        if(!io){
            throw new Error("Socket.io not initialized!");
        }
        return io;
    }

}