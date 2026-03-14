require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 TravelSquad Server running on port ${PORT}`);
    console.log(`📡 Socket.io initialized`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
