const app = require('./src/app');
require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log('JWT Secret configured');
      console.log(`Database: ${process.env.DB_NAME}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
