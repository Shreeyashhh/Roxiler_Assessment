const app = require('./app');
const config = require('./config');

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Store Rating API Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;
