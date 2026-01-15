# TaskBuddy: A Web-Based Family Activity Planning System

## Project Overview
TaskBuddy is a comprehensive family activity management platform designed to enhance child engagement and household responsibility through structured task assignment, monitoring, and a reward-based motivation system.

**Academic Project by:** Souleymane Camara - BIT1007326  
**Institution:** Regional Maritime University, Faculty of Engineering  
**Department:** Information Communication Technology  
**Program:** BSc Information Technology

## Project Vision
To empower families with a digital solution that promotes responsibility, autonomy, and collaboration in household management, specifically targeting children aged 10-16 years.

## Key Features

### User Roles
- **Admin**: System oversight and management
- **Parent**: Primary account holder, task creator, reviewer
- **Spouse**: Co-parent with similar privileges as parent
- **Child**: Task recipient, photo uploader, reward redeemer

### Core Functionality
1. **Task Management**
   - Create tasks with detailed specifications
   - Photo upload requirements for task verification
   - Recurring task scheduling
   - Priority levels and deadline tracking
   - Category/tag organization

2. **Review System**
   - Photo-based task verification
   - Approval/rejection workflow
   - Comment and feedback mechanism
   - Resubmission capability

3. **Reward System**
   - Points-based motivation
   - Custom reward creation
   - Redemption request workflow
   - Availability management

4. **Notification System**
   - In-app notifications
   - Email notifications
   - Real-time updates via Socket.io

5. **Reporting & Analytics**
   - Child performance tracking
   - Task completion analytics
   - Reward redemption reports
   - Family activity summaries

## Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS + DaisyUI
- **HTTP Client**: Axios
- **Routing**: React Router
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email Service**: Nodemailer
- **Real-time**: Socket.io

### Development Tools
- **Version Control**: Git/GitHub
- **API Testing**: Postman
- **IDE**: VS Code

## Project Structure
```
TaskBuddy/
│
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Parent, Child, Admin dashboards
│   │   ├── services/        # API calls
│   │   ├── context/         # State management
│   │   ├── utils/           # Helper functions
│   │   └── App.jsx
│   └── package.json
│
├── backend/                  # Node.js + Express API
│   ├── config/              # Database configuration
│   ├── controllers/         # Business logic
│   ├── models/              # Database models
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth & validation
│   ├── uploads/             # Photo storage
│   └── server.js
│
├── database/
│   └── schema.sql           # Database structure
│
└── README.md
```

## Development Phases

### Phase 1: Project Setup & Database Design ✅
- Project initialization
- Database schema design
- Development environment setup

### Phase 2: Backend Development
- API development
- Authentication system
- File upload handling
- Email notifications

### Phase 3: Frontend Development
- User interfaces
- Role-based dashboards
- Component development

### Phase 4: Integration & Testing
- Frontend-backend integration
- System testing
- Bug fixes

### Phase 5: Deployment & Documentation
- Production deployment
- User documentation
- Final report

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Git
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with API endpoint

# Start development server
npm run dev
```

## Database Schema
The database consists of the following main tables:
- **users**: Stores all user accounts (admin, parent, spouse, child)
- **families**: Family grouping and relationships
- **tasks**: Task definitions and assignments
- **task_submissions**: Photo uploads and completion records
- **rewards**: Available rewards catalog
- **reward_redemptions**: Redemption requests and history
- **notifications**: System notifications
- **points_log**: Points transaction history

## API Documentation
API endpoints follow RESTful conventions:
- `/api/auth/*` - Authentication & registration
- `/api/tasks/*` - Task management
- `/api/rewards/*` - Reward system
- `/api/notifications/*` - Notification handling
- `/api/reports/*` - Analytics and reports

## Research Context

### Problem Statement
Families lack specialized digital tools for parent-child collaboration in household management, resulting in reduced motivation and limited child participation in household responsibilities.

### Research Objectives
1. Design an interactive platform for task assignment and monitoring
2. Integrate motivational reward systems
3. Implement secure, role-based access control

### Significance
- **For Families**: Structured tool for collaboration
- **For Children**: Encourages responsibility and autonomy
- **For Research**: Contributes to family-centered digital platform knowledge
- **For Society**: Develops disciplined, independent individuals

## Target Audience
- Primary: Families with children aged 10-16 years
- Geographic Focus: Ghana (aligned with ICT access statistics)

## Contributing
This is an academic project. For questions or suggestions, please contact the project author.

## License
This project is developed for academic purposes at Regional Maritime University.

## Contact
**Developer**: Souleymane Camara  
**Student ID**: BIT1007326  
**Institution**: Regional Maritime University  
**Department**: Information Communication Technology

---
**Last Updated**: January 2026
