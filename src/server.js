require("dotenv").config();
const http = require("http");

const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./socket");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("WebSocket server ready. Listening for connections...");
  });
});
