# TaskBuddy - Family Activity Planning System

[![Status](https://img.shields.io/badge/Status-Phase%204%20Complete-success)](https://github.com/camarasama/taskbuddy)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-Academic-orange)](LICENSE)

A comprehensive web-based family activity planning system designed to enhance child engagement and household responsibility through structured task management and reward systems.

**Academic Project** - BSc Information Technology Final Year Project  
**Student**: Souleymane Camara (BIT1007326)  
**Institution**: Regional Maritime University  
**Department**: Information Communication Technology

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Development Progress](#development-progress)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

TaskBuddy is designed to help families (especially those with children aged 10-16) manage household activities collaboratively. The system provides:

- **Task Management**: Create, assign, and track household tasks
- **Photo Verification**: Ensure task completion with photo evidence
- **Points & Rewards**: Motivate children through gamification
- **Real-time Notifications**: Keep everyone updated instantly
- **Family Analytics**: Track performance and engagement

### Problem Statement

Traditional household management methods (verbal reminders, paper charts) lack:
- Accountability and verification
- Child-focused motivation systems
- Real-time progress tracking
- Family-wide visibility

TaskBuddy addresses these gaps with a modern, digital solution.

---

## ✨ Features

### User Management
- ✅ Role-based access (Admin, Parent, Spouse, Child)
- ✅ Email verification and password reset
- ✅ Profile management with avatar upload
- ✅ JWT-based authentication

### Family Management
- ✅ Create and manage family groups
- ✅ Unique family codes for invitations
- ✅ Add children and spouse accounts
- ✅ Family member role assignment

### Task System
- ✅ Task creation with categories and priorities
- ✅ Photo verification requirements
- ✅ Recurring task schedules
- ✅ Deadline management
- ✅ Task assignment to children

### Assignment & Review
- ✅ Task submission with photo upload
- ✅ Parent/Spouse approval workflow
- ✅ Rejection with feedback
- ✅ Resubmission capability
- ✅ Overdue task tracking

### Points & Rewards
- ✅ Points awarded for completed tasks
- ✅ Reward catalog management
- ✅ Redemption request system
- ✅ Points transaction history
- ✅ Family leaderboard

### Notifications
- ✅ In-app notifications
- ✅ Email notifications
- ✅ Real-time updates (Socket.io)
- ✅ Deadline reminders
- ✅ Task and reward alerts

### Reports & Analytics ✅ (Phase 4 Complete)
- ✅ Child performance reports with scoring
- ✅ Task completion analytics with trends
- ✅ Reward redemption analytics
- ✅ Family activity summaries
- ✅ Parent activity logs
- ✅ Performance scoring (4 dimensions)
- ✅ Family engagement metrics
- ✅ Predictive analytics
- ✅ CSV/PDF export (7 report types)
- ✅ Chart-ready data formatting
- ✅ 50+ unit and integration tests

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **File Upload**: Multer
- **Validation**: express-validator
- **Testing**: Jest + Supertest
- **Reports**: json2csv + PDFKit

### Frontend (Coming in Phase 5)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Development Tools
- **Version Control**: Git/GitHub
- **API Testing**: Postman
- **Database Tool**: pgAdmin / TablePlus
- **IDE**: VS Code

---

## 📁 Project Structure

```
taskbuddy/
├── backend/
│   ├── server.js                   # Main application entry
│   ├── config/
│   │   └── database.js             # Database configuration
│   ├── controllers/                # Business logic (13 files)
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── family.controller.js
│   │   ├── task.controller.js
│   │   ├── assignment.controller.js
│   │   ├── reward.controller.js
│   │   ├── redemption.controller.js
│   │   ├── notification.controller.js
│   │   ├── points.controller.js
│   │   ├── report.controller.js       # Phase 4
│   │   ├── analytics.controller.js    # Phase 4
│   │   └── export.controller.js       # Phase 4
│   ├── routes/                     # API routes (13 files)
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── family.routes.js
│   │   ├── task.routes.js
│   │   ├── assignment.routes.js
│   │   ├── reward.routes.js
│   │   ├── redemption.routes.js
│   │   ├── notification.routes.js
│   │   ├── points.routes.js
│   │   ├── report.routes.js           # Phase 4
│   │   ├── analytics.routes.js        # Phase 4
│   │   ├── export.routes.js           # Phase 4
│   │   └── index.js
│   ├── middleware/                 # Middleware (4 files)
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validator.middleware.js
│   │   └── upload.middleware.js
│   ├── services/                   # Business services (7 files)
│   │   ├── email.service.js
│   │   ├── notification.service.js
│   │   ├── points.service.js
│   │   ├── task.service.js
│   │   ├── report.service.js          # Phase 4
│   │   ├── analytics.service.js       # Phase 4
│   │   └── export.service.js          # Phase 4
│   ├── database/
│   │   └── queries/                # Database queries (5 files)
│   │       ├── childPerformance.queries.js
│   │       ├── taskAnalytics.queries.js
│   │       ├── rewardAnalytics.queries.js
│   │       ├── familySummary.queries.js
│   │       └── parentActivity.queries.js
│   ├── validators/                 # Request validators (1 file)
│   │   └── report.validator.js        # Phase 4
│   ├── utils/                      # Utilities (6 files)
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   ├── validation.schemas.js
│   │   ├── reportFormatters.js        # Phase 4
│   │   ├── chartDataFormatter.js      # Phase 4
│   │   └── dateRangeHelper.js         # Phase 4
│   ├── tests/                      # Tests (3 files)
│   │   ├── unit/
│   │   │   ├── reportService.test.js
│   │   │   └── analyticsService.test.js
│   │   └── integration/
│   │       └── reports.test.js
│   ├── models/                     # Database models (Phase 2)
│   ├── uploads/                    # Uploaded files
│   ├── exports/                    # Generated reports
│   └── logs/                       # Application logs
├── database/
│   └── schema.sql                  # Database schema
├── docs/                           # Documentation
│   ├── API_REPORTS.md              # Reports API docs
│   └── ANALYTICS_GUIDE.md          # Analytics guide
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore file
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn
- Git

### Clone Repository

```bash
git clone https://github.com/camarasama/taskbuddy.git
cd taskbuddy
```

### Install Dependencies

```bash
cd backend
npm install
```

---

## ⚙️ Environment Setup

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskbuddy
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_EXPIRES_IN=24h

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Feature Flags
ENABLE_SCHEDULED_TASKS=true
```

### Generate JWT Secrets

```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗄️ Database Setup

### 1. Create Database

```bash
createdb taskbuddy
```

Or using psql:

```sql
CREATE DATABASE taskbuddy;
```

### 2. Run Schema

```bash
psql -U your_username -d taskbuddy -f database/schema.sql
```

Or:

```sql
\i database/schema.sql
```

The schema includes:
- 11 tables with proper relationships
- Indexes for performance
- Views for common queries
- Triggers for automatic updates
- Sample data (optional)

---

## ▶️ Running the Application

### Development Mode

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5000`

### Production Mode

```bash
cd backend
npm start
```

### Check Health

Visit: `http://localhost:5000/api/health`

Response:
```json
{
  "success": true,
  "message": "TaskBuddy API is running",
  "timestamp": "2026-01-16T15:00:00.000Z",
  "environment": "development"
}
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### API Endpoints (161 total)

#### Authentication (10 endpoints)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Verify email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout
- And more...

#### Users (9 endpoints)
- `GET /users/profile` - Get profile
- `PUT /users/profile` - Update profile
- `POST /users/profile/avatar` - Upload avatar
- And more...

#### Families (14 endpoints)
- `POST /families` - Create family
- `GET /families` - Get user's families
- `POST /families/join` - Join with code
- `GET /families/:id/members` - Get members
- And more...

#### Tasks (11 endpoints)
- `POST /tasks` - Create task
- `GET /tasks` - Get tasks (with filters)
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- And more...

#### Assignments (16 endpoints)
- `POST /assignments` - Assign task
- `PATCH /assignments/:id/start` - Start task
- `POST /assignments/:id/submit` - Submit task
- `POST /assignments/:id/review` - Review task
- And more...

#### Rewards (12 endpoints)
- `POST /rewards` - Create reward
- `GET /rewards` - Get rewards
- `POST /rewards/:id/image` - Upload image
- And more...

#### Redemptions (13 endpoints)
- `POST /redemptions` - Request redemption
- `GET /redemptions/my-requests` - My requests
- `POST /redemptions/:id/review` - Review request
- And more...

#### Notifications (13 endpoints)
- `GET /notifications` - Get notifications
- `GET /notifications/unread` - Get unread
- `PATCH /notifications/:id/read` - Mark as read
- And more...

#### Points (15 endpoints)
- `GET /points/balance` - Get balance
- `GET /points/history` - Get history
- `POST /points/adjust` - Adjust points
- `GET /points/leaderboard/:familyId` - Leaderboard
- And more...

#### Reports (21 endpoints)
- `GET /reports/child-performance/:childId` - Performance report
- `GET /reports/task-analytics/:familyId` - Task analytics
- `GET /reports/family-summary/:familyId` - Family summary
- And more...

#### Analytics (11 endpoints) ✅ Phase 4
- `GET /analytics/performance-score` - Calculate performance score
- `GET /analytics/family-engagement` - Calculate engagement
- `GET /analytics/performance-trend` - Analyze trends
- `GET /analytics/children-comparison` - Compare children
- `GET /analytics/predict-completion` - Predict task completion
- `GET /analytics/charts/monthly-trend` - Monthly trend data
- `GET /analytics/charts/category-breakdown` - Category chart
- And more...

#### Export (10 endpoints) ✅ Phase 4
- `POST /export/csv/child-performance` - Export to CSV
- `POST /export/pdf/child-performance` - Export to PDF
- `GET /export/download/:filename` - Download file
- `GET /export/files` - List exported files
- And more...

For complete API documentation, see `/docs/API_REPORTS.md`.

---

## 📊 Development Progress

### ✅ Phase 1: Project Setup & Database Design (Complete)
- [x] Project structure setup
- [x] Database schema design
- [x] ER diagram
- [x] Documentation

### ✅ Phase 2: Database Models (Complete)
- [x] PostgreSQL models (11 files)
- [x] Database connection
- [x] Model relationships
- [x] Transaction support

### ✅ Phase 3: Backend API (Complete)
- [x] 134 REST API endpoints
- [x] JWT authentication
- [x] Role-based access control
- [x] File upload handling
- [x] Email notifications
- [x] Real-time notifications (Socket.io)
- [x] Points management
- [x] Comprehensive validation

### ✅ Phase 4: Reports & Analytics (Complete) - **Current Phase**
- [x] 27 additional API endpoints (161 total)
- [x] 5 comprehensive report types
- [x] Advanced analytics (8 features)
- [x] Performance scoring system (4 dimensions)
- [x] Family engagement metrics
- [x] Trend analysis and predictions
- [x] CSV/PDF export (7 report types)
- [x] Chart-ready data formatting
- [x] 12 request validators
- [x] 30 unit tests
- [x] 20 integration tests
- [x] Complete API documentation
- [x] Analytics implementation guide

### 🔄 Phase 5: Frontend Development (Next - Starting Now)
- [ ] React setup with Vite + Tailwind CSS
- [ ] Authentication pages (login, register, verify)
- [ ] Parent dashboard (task & reward management)
- [ ] Child dashboard (task completion, rewards)
- [ ] Admin dashboard (system management)
- [ ] Component library (reusable UI components)
- [ ] API integration layer
- [ ] Real-time notifications UI
- [ ] Charts and analytics visualization
- [ ] Responsive design for mobile

### ⏳ Phase 6: Integration & Testing
- [ ] Frontend-Backend integration
- [ ] End-to-end testing
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Bug fixes and refinements

### ⏳ Phase 7: Deployment
- [ ] Production environment setup
- [ ] Backend deployment (Heroku/Railway/Render)
- [ ] Frontend deployment (Vercel/Netlify)
- [ ] Domain & SSL configuration
- [ ] Database migration to production

### ⏳ Phase 8: Final Report & Documentation
- [ ] Complete project documentation
- [ ] User manual with screenshots
- [ ] Technical documentation
- [ ] Presentation materials
- [ ] Video demonstration

**Overall Progress:** 50% (4/8 phases complete)  
**Backend Progress:** 100% ✅  
**Frontend Progress:** 0% (starting Phase 5)

---

## 🤝 Contributing

This is an academic project. Contributions, suggestions, and feedback are welcome!

### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is an academic work submitted as part of the BSc Information Technology program at Regional Maritime University. All rights reserved.

---

## 👨‍🎓 Author

**Souleymane Camara**  
Student ID: BIT1007326  
Department of Information Communication Technology  
Regional Maritime University  
Email: souleymane.camara@st.rmu.edu.gh

---

## 🙏 Acknowledgments

- Regional Maritime University
- Project Supervisor: Isaac Acheampong / Harry-Johnson Agyemang 
- Department of Information Communication Technology
- Family and friends for support

---

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Contact: souleymane.camara@st.rmu.edu.gh

---

**Built with ❤️ for families everywhere**