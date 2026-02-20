require('dotenv').config();
require("./src/db/db");
const initSocketServer = require('./src/sockets/socket.server');
const app = require("./src/app");
const httpServer = require('http').createServer(app);


initSocketServer(httpServer);


httpServer.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
