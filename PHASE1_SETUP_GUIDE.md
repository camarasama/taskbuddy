# TaskBuddy - Phase 1: Setup & Database Installation Guide

## Phase 1 Overview

**Phase 1 Focus**: Project initialization, database design, and development environment setup

**Deliverables**:
✓ Project structure created
✓ Database schema designed
✓ Development environment configured
✓ Documentation completed

---

## Prerequisites Installation

### 1. Install Node.js
**Required Version**: Node.js 18.x or higher

**Windows**:
```bash
# Download from https://nodejs.org/
# Run installer and follow prompts
# Verify installation:
node --version
npm --version
```

**macOS**:
```bash
# Using Homebrew
brew install node

# Verify installation
node --version
npm --version
```

**Linux (Ubuntu/Debian)**:
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install PostgreSQL
**Required Version**: PostgreSQL 14.x or higher

**Windows**:
```bash
# Download from https://www.postgresql.org/download/windows/
# Run installer
# Remember your postgres password!
# Add to PATH if not automatic
```

**macOS**:
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14

# Verify installation
psql --version
```

**Linux (Ubuntu/Debian)**:
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

### 3. Install Git
**Windows**: Download from https://git-scm.com/download/win

**macOS**:
```bash
brew install git
```

**Linux**:
```bash
sudo apt install git
```

**Verify**:
```bash
git --version
```

### 4. Install VS Code (Recommended IDE)
Download from: https://code.visualstudio.com/

**Recommended Extensions**:
- ESLint
- Prettier
- PostgreSQL (by Chris Kolkman)
- Thunder Client (for API testing)
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

### 5. Install Postman (API Testing)
Download from: https://www.postman.com/downloads/

---

## Database Setup

### Step 1: Create Database User
```bash
# Access PostgreSQL (Linux/macOS)
sudo -u postgres psql

# Windows: Open SQL Shell (psql) from Start menu
# Login as postgres user
```

```sql
-- Create database user for TaskBuddy
CREATE USER taskbuddy_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
ALTER USER taskbuddy_user CREATEDB;
```

### Step 2: Create Database
```sql
-- Create the database
CREATE DATABASE taskbuddy_db OWNER taskbuddy_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE taskbuddy_db TO taskbuddy_user;

-- Exit psql
\q
```

### Step 3: Import Schema
```bash
# Navigate to project directory
cd TaskBuddy/database

# Import schema (Linux/macOS)
psql -U taskbuddy_user -d taskbuddy_db -f schema.sql

# Windows
psql -U taskbuddy_user -d taskbuddy_db -f schema.sql
# Enter password when prompted
```

### Step 4: Verify Database Setup
```bash
# Connect to database
psql -U taskbuddy_user -d taskbuddy_db

# List all tables
\dt

# Check specific table structure
\d users

# View sample data (if any)
SELECT * FROM users;

# Exit
\q
```

**Expected Output**: You should see 10 tables listed:
- users
- families
- family_members
- tasks
- task_assignments
- task_submissions
- rewards
- reward_redemptions
- points_log
- notifications

---

## Project Initialization

### Step 1: Clone/Download Project
```bash
# If using Git
git clone <repository-url>
cd TaskBuddy

# Or extract from ZIP and navigate to folder
cd TaskBuddy
```

### Step 2: Create Project Folders
```bash
# Create backend structure
mkdir -p backend/{config,controllers,models,routes,middleware,uploads}

# Create frontend structure  
mkdir -p frontend/{public,src/{components,pages,services,context,utils}}

# Verify structure
ls -R
```

### Step 3: Initialize Backend
```bash
# Navigate to backend
cd backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express pg bcrypt jsonwebtoken dotenv cors
npm install multer nodemailer socket.io
npm install --save-dev nodemon

# Create .env file
touch .env
```

**Edit backend/.env**:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskbuddy_db
DB_USER=taskbuddy_user
DB_PASSWORD=your_secure_password

# JWT Secret (generate a strong random string)
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Email Configuration (for Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=TaskBuddy <noreply@taskbuddy.com>

# Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Update backend/package.json** scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### Step 4: Initialize Frontend
```bash
# Navigate to frontend
cd ../frontend

# Create Vite React app
npm create vite@latest . -- --template react

# Install dependencies
npm install

# Install additional packages
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer daisyui

# Initialize Tailwind CSS
npx tailwindcss init -p
```

**Configure Tailwind (frontend/tailwind.config.js)**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}
```

**Update frontend/src/index.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Create frontend/.env**:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Git Configuration

### Step 1: Initialize Repository
```bash
# From TaskBuddy root directory
git init

# Create .gitignore
touch .gitignore
```

**Edit .gitignore**:
```
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Environment variables
.env
.env.local
.env.development
.env.production

# Build files
frontend/dist/
frontend/build/

# Uploads (don't commit user uploads)
backend/uploads/*
!backend/uploads/.gitkeep

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
```

### Step 2: Create README Templates
```bash
# Create backend README
touch backend/README.md

# Create frontend README
touch frontend/README.md
```

### Step 3: Initial Commit
```bash
# Add all files
git add .

# First commit
git commit -m "Initial commit: Phase 1 - Project setup and database schema"

# Create development branch
git checkout -b development
```

---

## Testing Database Connection

### Create Test Script (backend/test-db.js)
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current time from database:', result.rows[0].now);
    
    // Test table existence
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('\n📋 Available tables:');
    tables.rows.forEach(row => console.log('  -', row.table_name));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

### Run Test
```bash
cd backend
node test-db.js
```

**Expected Output**:
```
✅ Database connection successful!
Current time from database: 2026-01-15T...

📋 Available tables:
  - users
  - families
  - family_members
  - tasks
  - task_assignments
  - task_submissions
  - rewards
  - reward_redemptions
  - points_log
  - notifications
```

---

## Phase 1 Completion Checklist

### Project Setup
- [ ] Node.js installed and verified
- [ ] PostgreSQL installed and running
- [ ] Git installed and configured
- [ ] VS Code installed with extensions
- [ ] Postman installed

### Database
- [ ] Database created (taskbuddy_db)
- [ ] Database user created (taskbuddy_user)
- [ ] Schema imported successfully
- [ ] All 10 tables created
- [ ] Database connection tested
- [ ] Views created (v_active_tasks_summary, v_child_performance)

### Project Structure
- [ ] Backend folder structure created
- [ ] Frontend folder structure created
- [ ] Backend npm initialized
- [ ] Frontend Vite React app created
- [ ] Dependencies installed (backend & frontend)
- [ ] Environment files configured (.env)
- [ ] Tailwind CSS configured

### Documentation
- [ ] README.md created
- [ ] DATABASE_DESIGN.md reviewed
- [ ] ER_DIAGRAM.md reviewed
- [ ] schema.sql documented

### Version Control
- [ ] Git repository initialized
- [ ] .gitignore configured
- [ ] Initial commit made
- [ ] Development branch created

---

## Troubleshooting Common Issues

### Issue 1: PostgreSQL Connection Refused
**Solution**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Start if not running
sudo systemctl start postgresql  # Linux
brew services start postgresql@14  # macOS
```

### Issue 2: Permission Denied on Database
**Solution**:
```sql
-- Grant proper privileges
GRANT ALL PRIVILEGES ON DATABASE taskbuddy_db TO taskbuddy_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taskbuddy_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taskbuddy_user;
```

### Issue 3: Port Already in Use
**Solution**:
```bash
# Find process using port
lsof -i :5000  # Backend
lsof -i :5173  # Frontend

# Kill process
kill -9 <PID>
```

### Issue 4: npm Install Fails
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Next Steps (Phase 2)

After completing Phase 1, you're ready for Phase 2: Backend Development

**Phase 2 will include**:
- Database connection configuration
- User authentication API
- Task management endpoints
- Reward system endpoints
- File upload handling
- Email notification setup

---

## Additional Resources

### Documentation
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tutorials
- [JWT Authentication](https://jwt.io/introduction)
- [Multer File Uploads](https://github.com/expressjs/multer)
- [Nodemailer Setup](https://nodemailer.com/about/)
- [Socket.io Real-time](https://socket.io/docs/v4/)

---

**Phase 1 Completed**: January 2026  
**Author**: Souleymane Camara - BIT1007326  
**Institution**: Regional Maritime University

**Ready for Phase 2**: Backend Development 🚀
