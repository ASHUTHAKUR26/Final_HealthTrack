const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes   = require('./routes/auth');
const healthRoutes = require('./routes/health');
const aiRoutes     = require('./routes/ai');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',   authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/ai',     aiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Health Track System API is running 🚀' });
});

async function startServer() {
  const PORT = process.env.PORT || 5000;

  // ── Try MongoDB Atlas first ──────────────────────────────────────────────
  const mongoUri = process.env.MONGO_URI;
  const hasRealUri = mongoUri &&
    !mongoUri.includes('<username>') &&
    !mongoUri.includes('<password>');

  if (hasRealUri) {
    console.log('⏳ Connecting to MongoDB Atlas...');
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        
      });
      console.log('✅ MongoDB Atlas connected');
      console.log('   Database:', mongoose.connection.name);
    } catch (err) {
      // console.error('❌ MongoDB Atlas failed:', err.message);
      console.error('❌ MongoDB Atlas failed:');
      console.error(err);
      console.log('');
      console.log('📋 QUICK FIX FOR querySrv ENOTFOUND:');
      console.log('   1. Open MongoDB Atlas → Network Access');
      console.log('   2. Click "Add IP Address" → "Allow Access from Anywhere"');
      console.log('   3. Wait 2 minutes, then restart the server');
      console.log('');
      console.log('⚠️  Falling back to in-memory database (data will not persist)...');

      // ── Fallback to in-memory MongoDB ──────────────────────────────────
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri());
        console.log('✅ In-memory MongoDB started (temporary — fix Atlas to persist data)');
      } catch (memErr) {
        console.error('❌ In-memory MongoDB also failed:', memErr.message);
        process.exit(1);
      }
    }
  } else {
    // No real URI — use in-memory
    console.log('⚠️  No MONGO_URI found — starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ In-memory MongoDB started');
  }

  app.listen(PORT, () => {
    console.log('');
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📋 API ready at http://localhost:${PORT}/api`);
    if (!process.env.GEMINI_API_KEY) {
      console.log('⚠️  GEMINI_API_KEY not set — AI Assistant will show setup guide');
    } else {
      console.log('🤖 AI Assistant (Gemini) ready');
    }
    console.log('');
  });
}

startServer();
