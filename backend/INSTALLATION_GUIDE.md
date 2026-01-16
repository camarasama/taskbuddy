# TaskBuddy Phase 2 - Installation Guide

## ✅ What You Have

All 11 database models have been split into separate files:
- `index.js` - Exports all models
- `FamilyModel.js` - Family management
- `UserModel.js` - User accounts
- `FamilyMemberModel.js` - Family membership & points
- `TaskModel.js` - Task definitions
- `TaskAssignmentModel.js` - Task assignments
- `TaskSubmissionModel.js` - Photo submissions
- `RewardModel.js` - Rewards catalog
- `RewardRedemptionModel.js` - Reward redemptions
- `NotificationModel.js` - Notifications
- `PointsLogModel.js` - Points transaction history
- `RegistrationSessionModel.js` - Session management (Phase 3)

## 📦 How to Install in Your Project

### Step 1: Copy Files to Your Project

```bash
# Navigate to your project
cd ~/taskbuddy

# Create backend directories if they don't exist
mkdir -p backend/config
mkdir -p backend/models
mkdir -p backend/scripts

# Download all files and place them in:
# - backend/config/database.js
# - backend/models/*.js (all 12 model files)
# - backend/scripts/*.js (setup and test scripts)
# - backend/.env.example
# - backend/package.json
# - database/schema.sql
```

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `pg` - PostgreSQL driver
- `express` - Web framework
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `nodemailer` - Email sending
- `dotenv` - Environment variables
- And other dependencies

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your details
nano .env
```

Update these values in `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskbuddy_db
DB_USER=postgres
DB_PASSWORD=your_actual_password_here
```

### Step 4: Setup Database

```bash
# Run the setup script
npm run setup-db
```

Expected output:
```
🚀 Starting database setup...
📦 Creating database: taskbuddy_db
✅ Database created successfully
🔧 Executing schema...
✅ Schema executed successfully
📊 Created tables:
   - families
   - users
   - family_members
   - tasks
   - task_assignments
   - task_submissions
   - rewards
   - reward_redemptions
   - points_log
   - notifications
✨ Database setup completed successfully!
```

### Step 5: Test Connection

```bash
npm run test-db
```

Expected output:
```
🔍 Testing database connection...
1️⃣  Testing basic connection...
   ✅ Connected successfully!
2️⃣  Checking database tables...
   ✅ Found 10 tables
3️⃣  Testing table accessibility...
   ✅ users - accessible
   ✅ families - accessible
   ✅ tasks - accessible
   ...
✨ Database connection test completed successfully!
```

## 📝 How to Use Models

### Import Models

```javascript
// Import specific models
const { UserModel, TaskModel } = require('./models');

// Or import all
const models = require('./models');
const UserModel = models.UserModel;
```

### Example Usage

```javascript
// Create a user
const user = await UserModel.create({
    email: 'parent@example.com',
    passwordHash: hashedPassword,
    fullName: 'John Doe',
    role: 'parent',
    emailVerified: false
});

// Find user by email
const foundUser = await UserModel.findByEmail('parent@example.com');

// Create a family
const family = await FamilyModel.create(
    'Doe Family',
    user.user_id,
    'DOE2026'
);

// Add user to family
const member = await FamilyMemberModel.create(
    family.family_id,
    user.user_id,
    'parent'
);

// Create a task
const task = await TaskModel.create({
    familyId: family.family_id,
    createdBy: user.user_id,
    title: 'Clean your room',
    pointsReward: 50,
    priority: 'medium'
});
```

## 🗂️ Project Structure

After installation, your project should look like:

```
taskbuddy/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── index.js
│   │   ├── FamilyModel.js
│   │   ├── UserModel.js
│   │   ├── FamilyMemberModel.js
│   │   ├── TaskModel.js
│   │   ├── TaskAssignmentModel.js
│   │   ├── TaskSubmissionModel.js
│   │   ├── RewardModel.js
│   │   ├── RewardRedemptionModel.js
│   │   ├── NotificationModel.js
│   │   ├── PointsLogModel.js
│   │   └── RegistrationSessionModel.js
│   ├── scripts/
│   │   ├── setup-database.js
│   │   └── test-connection.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── database/
│   └── schema.sql
└── frontend/
    └── (Phase 5)
```

## ✅ Verification Checklist

- [ ] PostgreSQL is installed and running
- [ ] All files copied to correct locations
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with database credentials
- [ ] Database setup completed (`npm run setup-db`)
- [ ] Connection test passed (`npm run test-db`)
- [ ] All 10 tables created successfully

## 🔧 Troubleshooting

### "Connection refused"
- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Start PostgreSQL: `sudo systemctl start postgresql`

### "Database does not exist"
- Run the setup script: `npm run setup-db`

### "Permission denied"
- Make sure your PostgreSQL user has the correct permissions
- Or use the `postgres` superuser for development

### "Module not found"
- Make sure you ran `npm install` in the backend directory
- Check that all model files are in `backend/models/`

## 📚 Next Steps

Now that Phase 2 is complete, you're ready for:

**Phase 3: API Routes & Controllers**
- Authentication routes (register, login, verify email)
- Task management endpoints
- Reward system endpoints
- User profile endpoints
- Notification endpoints

## 🆘 Need Help?

If you encounter any issues:
1. Check the README.md for detailed documentation
2. Review the error messages carefully
3. Make sure all environment variables are set correctly
4. Verify PostgreSQL is running and accessible

---

**Phase 2 Status**: ✅ COMPLETE  
**All Models**: ✅ READY  
**Database**: ✅ READY  
**Next Phase**: Phase 3 - API Development
