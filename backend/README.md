# TaskBuddy Backend

Backend API for TaskBuddy - A Web-Based Family Activity Planning System

## 🚀 Project Overview

TaskBuddy is a comprehensive family task management system designed to enhance child engagement and household responsibility through a structured reward-based approach.

**Student:** Souleymane Camara (BIT1007326)  
**Institution:** Regional Maritime University  
**Program:** BSc Information Technology

## 📋 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Parent, Spouse, Child)
  - Secure password hashing with bcrypt

- **Task Management**
  - Create, assign, and track tasks
  - Photo upload verification
  - Task status workflow (pending → in progress → pending review → completed/rejected)
  - Recurring task scheduling
  - Priority levels and deadlines

- **Reward System**
  - Points-based rewards
  - Reward redemption requests
  - Parent approval workflow

- **Real-time Notifications**
  - Socket.io for instant updates
  - Email notifications via Nodemailer
  - Task assignments, approvals, and deadline reminders

- **Reporting & Analytics**
  - Child performance reports
  - Task analytics
  - Family activity summaries

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer
- **Email Service:** Nodemailer
- **Real-time Communication:** Socket.io
- **Validation:** express-validator
- **Security:** bcryptjs, CORS

## 📁 Project Structure

```
backend/
├── config/                     # Configuration files
│   ├── database.js             # Database connection settings
│   └── email.js                # Email service configuration
├── controllers/                # Request handlers (API logic)
│   ├── analytics.controller.js
│   ├── assignment.controller.js
│   ├── auth.controller.js
│   ├── export.controller.js
│   ├── family.controller.js
│   ├── notification.controller.js
│   ├── points.controller.js
│   ├── redemption.controller.js
│   ├── report.controller.js
│   ├── reward.controller.js
│   ├── task.controller.js
│   └── user.controller.js
├── database/                   # Database resources
│   ├── queries/                # Raw SQL queries for analytics
│   │   ├── childPerformance.queries.js
│   │   ├── familySummary.queries.js
│   │   ├── parentActivity.queries.js
│   │   ├── rewardAnalytics.queries.js
│   │   └── taskAnalytics.queries.js
│   └── schema.sql              # Database schema definitions
├── middleware/                 # Express middleware
│   ├── auth.middleware.js      # JWT authentication
│   ├── errorHandler.middleware.js
│   ├── role.middleware.js      # RBAC checks
│   ├── upload.middleware.js    # Multer configuration
│   └── validator.middleware.js # Input validation
├── models/                     # Sequelize models
│   ├── FamilyMemberModel.js
│   ├── FamilyModel.js
│   ├── NotificationModel.js
│   ├── PointsLogModel.js
│   ├── RegistrationSessionModel.js
│   ├── RewardModel.js
│   ├── RewardRedemptionModel.js
│   ├── TaskAssignmentModel.js
│   ├── TaskModel.js
│   ├── TaskSubmissionModel.js
│   ├── UserModel.js
│   └── index.js                # Model associations
├── routes/                     # API route definitions
│   ├── Assignment.routes.js
│   ├── Auth.routes.js
│   ├── Family.routes.js
│   ├── Notification.routes.js
│   ├── Points.routes.js
│   ├── Redemption.routes.js
│   ├── Report.routes.js
│   ├── Reward.routes.js
│   ├── Task.routes.js
│   ├── User.routes.js
│   ├── analytics.routes.js
│   ├── export.routes.js
│   └── index.js                # Main router entry point
├── scripts/                    # Utility scripts
│   ├── clean-expired-sessions.js
│   ├── setup-database.js
│   └── test-connection.js
├── services/                   # Business logic layer
│   ├── analytics.service.js
│   ├── email.service.js
│   ├── export.service.js
│   ├── notification.service.js
│   ├── points.service.js
│   ├── report.service.js
│   └── task.service.js
├── utils/                      # Helpers and constants
│   ├── chartDataFormatter.js
│   ├── constants.js
│   ├── dateRangeHelper.js
│   ├── helpers.js
│   ├── reportFormatters.js
│   └── validation.schemas.js
├── app.js                      # Express app setup
├── server.js                   # Server entry point
└── package.json
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd TaskBuddy/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskbuddy
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

FRONTEND_URL=http://localhost:5173
```

### Step 4: Set Up Database
```bash
# Create database
createdb taskbuddy

# Run database schema (will be created in next phase)
psql -d taskbuddy -f database/schema.sql
```

### Step 5: Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## 🔐 Authentication Flow

1. User registers or logs in
2. Server generates JWT token
3. Client stores token
4. Token sent in Authorization header: `Bearer <token>`
5. Middleware verifies token for protected routes

## 📡 API Endpoints (To be implemented)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all family members
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/status` - Update task status
- `POST /api/tasks/:id/submit` - Submit task for review

### Rewards
- `POST /api/rewards` - Create reward
- `GET /api/rewards` - Get all rewards
- `GET /api/rewards/:id` - Get reward by ID
- `PUT /api/rewards/:id` - Update reward
- `DELETE /api/rewards/:id` - Delete reward
- `POST /api/rewards/:id/redeem` - Request reward redemption

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

### Reports
- `GET /api/reports/child/:childId` - Child performance report
- `GET /api/reports/tasks` - Task analytics
- `GET /api/reports/family/:familyId` - Family activity summary

## 🔌 Socket.io Events

### Client → Server
- `join-family` - Join family room for real-time updates
- `leave-family` - Leave family room

### Server → Client
- `task-assigned` - New task assigned
- `task-updated` - Task status changed
- `task-approved` - Task approved
- `task-rejected` - Task rejected
- `reward-requested` - Reward redemption requested
- `reward-approved` - Reward approved
- `notification` - General notification

## 📧 Email Notifications

The system sends emails for:
- Welcome messages
- Task assignments
- Task completions (for review)
- Task approvals/rejections
- Deadline reminders
- Reward requests
- Reward approvals/denials

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation and sanitization
- CORS configuration
- SQL injection prevention
- File upload restrictions (type and size)

## 📊 Database Schema (To be created)

Tables to be implemented:
- users
- families
- tasks
- task_assignments
- rewards
- reward_redemptions
- notifications
- categories

## 🚧 Development Status

**Phase 1 - Backend Setup:** ✅ Completed
- Project structure created
- Middleware configured
- Email service setup
- Socket.io integration

**Phase 2 - Database & Models:** 🔄 In Progress
- Database schema design
- Model creation
- Database migrations

**Phase 3 - Controllers & Routes:** ⏳ Pending
- Business logic implementation
- API endpoint creation
- Route configuration

**Phase 4 - Testing & Deployment:** ⏳ Pending
- Unit testing
- Integration testing
- Deployment setup

## 🤝 Contributing

This is an academic project. For suggestions or issues, please contact the developer.

## 📝 License

This project is developed as part of academic requirements at Regional Maritime University.

## 👨‍💻 Developer

**Souleymane Camara**  
Student ID: BIT1007326  
Program: BSc Information Technology  
Institution: Regional Maritime University  
Faculty of Engineering - Department of ICT

---

**Project Title:** Design and Development of TaskBuddy: A Web-Based Family Activity Planning System for Enhancing Child Engagement and Household Responsibility

For questions or support, please refer to the project documentation.
