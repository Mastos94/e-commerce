# MongoDB Setup Guide for Windows

## Problem
The error `ECONNREFUSED 127.0.0.1:27017` means MongoDB is not running on your computer.

## Solution Options

### Option 1: Install MongoDB Community Server (Recommended)

#### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: **8.0** (or latest)
   - Platform: **Windows**
   - Package: **MSI**
3. Click **Download**

#### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **Complete** installation
3. **Important**: Check "Install MongoDB as a Service"
4. Check "Run service as Network Service user"
5. Click **Next** and **Install**

#### Step 3: Verify MongoDB is Running
```bash
# Open PowerShell and check if MongoDB service is running
Get-Service MongoDB

# If not running, start it:
Start-Service MongoDB

# Or start from Services app:
# Press Win+R, type: services.msc
# Find "MongoDB" and click "Start"
```

#### Step 4: Test Connection
```bash
# Install MongoDB Shell (mongosh) if not already installed
# Download from: https://www.mongodb.com/try/download/shell

# Test connection
mongosh mongodb://localhost:27017
```

#### Step 5: Run Seed Script
```bash
npm run db:seed
```

---

### Option 2: Use MongoDB Atlas (Cloud - Free Tier)

If you don't want to install MongoDB locally:

#### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account

#### Step 2: Create Free Cluster
1. Click "Build a Database"
2. Select **FREE** tier (M0 Sandbox)
3. Choose cloud provider and region (closest to you)
4. Click "Create"

#### Step 3: Setup Access
1. **Create Database User**:
   - Username: `synergy_admin`
   - Password: (create a strong password)
   - Role: Read and write to any database

2. **Add IP Address**:
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP

#### Step 4: Get Connection String
1. Click "Connect"
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://synergy_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

#### Step 5: Update .env File
```env
MONGODB_URI=mongodb+srv://synergy_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/synergy_ecommerce
```

**Important**: Replace `<password>` with your actual password (URL encode special characters)

#### Step 6: Run Seed Script
```bash
npm run db:seed
```

---

### Option 3: Use MongoDB Memory Server (For Testing Only)

This is already installed for tests, but can be used for development:

#### Create a dev seed script with memory server:

```bash
# Install MongoDB Memory Server as dev dependency (already installed)
npm install --save-dev mongodb-memory-server
```

Create `src/scripts/seed-dev.js`:
```javascript
require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function seedWithMemoryServer() {
  console.log('Starting MongoDB Memory Server...');
  
  // Start in-memory MongoDB
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  console.log(`Memory Server URI: ${uri}`);
  
  // Update your .env MONGODB_URI with this URI
  // Or run tests directly
  
  console.log('Memory server running. Press Ctrl+C to stop.');
  console.log('Update your .env file with the URI above, then run npm run db:seed');
}

seedWithMemoryServer();
```

---

## Quick Fix: Use MongoDB Atlas (Easiest)

**Fastest way to get started without installing anything:**

1. **Create free account**: https://www.mongodb.com/cloud/atlas/register
2. **Create free cluster** (takes 3 minutes)
3. **Get connection string** and update `.env`
4. **Run seed**: `npm run db:seed`

### Example .env for Atlas:
```env
NODE_ENV=development
PORT=3000

# MongoDB Atlas (replace with your actual credentials)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/synergy_ecommerce?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d

# Session Secret
SESSION_SECRET=your-super-secret-session-key-change-this-in-production-67890

# Bcrypt Salt Rounds
BCRYPT_SALT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Troubleshooting

### MongoDB installed but won't start
```bash
# Check if port 27017 is in use
netstat -ano | findstr :27017

# Check MongoDB logs
# Usually located at: C:\Program Files\MongoDB\Server\8.0\log\

# Try manual start
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db"
```

### Connection still refused
1. Make sure MongoDB service is running: `Get-Service MongoDB`
2. Check firewall isn't blocking port 27017
3. Try both `localhost` and `127.0.0.1` in connection string

### Atlas connection fails
1. Make sure IP whitelist includes your IP
2. Check password is correct (URL encode special chars like `@` → `%40`)
3. Verify cluster is deployed (not still building)

---

## After MongoDB is Running

Once MongoDB is successfully running, execute:

```bash
# Seed the database with sample data
npm run db:seed

# You should see:
# ✓ Connected to MongoDB
# ✓ Cleared existing data
# ✓ Created sample users
# ✓ Created 12 products
# ✅ Database seeded successfully!
```

Then start the development server:
```bash
npm run dev
```
