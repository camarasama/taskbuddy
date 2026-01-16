# TaskBuddy API Routes Summary
## Phase 3 - Routes Creation Complete ✅

This document provides an overview of all API routes created for the TaskBuddy backend.

---

## Route Files Created

### 1. **auth.routes.js** - Authentication Routes
**Base URL**: `/api/auth`

**Public Routes:**
- POST `/register` - Register new user
- POST `/login` - User login
- POST `/verify-email` - Verify email
- POST `/resend-verification` - Resend verification email
- POST `/forgot-password` - Request password reset
- POST `/reset-password` - Reset password

**Protected Routes:**
- GET `/me` - Get current user
- POST `/logout` - Logout user
- POST `/change-password` - Change password
- POST `/refresh-token` - Refresh JWT token

---

### 2. **user.routes.js** - User Management Routes
**Base URL**: `/api/users`

**User Profile Routes:**
- GET `/profile` - Get user profile
- PUT `/profile` - Update profile
- POST `/profile/avatar` - Upload avatar
- DELETE `/profile/avatar` - Delete avatar
- GET `/:userId` - Get user by ID
- DELETE `/account` - Delete account

**Admin Routes:**
- GET `/` - Get all users (Admin only)
- PUT `/:userId/status` - Toggle user status (Admin only)
- DELETE `/:userId` - Permanently delete user (Admin only)

---

### 3. **family.routes.js** - Family Management Routes
**Base URL**: `/api/families`

**Family CRUD Routes:**
- POST `/` - Create family (Parent only)
- GET `/` - Get user's families
- GET `/:familyId` - Get family by ID
- PUT `/:familyId` - Update family (Parent/Spouse)
- DELETE `/:familyId` - Delete family (Parent only)

**Member Management Routes:**
- POST `/join` - Join family with code
- GET `/:familyId/members` - Get family members
- POST `/:familyId/members` - Add family member (Parent/Spouse)
- GET `/:familyId/members/:userId` - Get member by ID
- PUT `/:familyId/members/:userId` - Update member (Parent/Spouse)
- DELETE `/:familyId/members/:userId` - Remove member (Parent/Spouse)
- POST `/:familyId/leave` - Leave family

**Family Code Routes:**
- GET `/:familyId/code` - Get family code
- POST `/:familyId/code/regenerate` - Regenerate code (Parent only)

---

### 4. **task.routes.js** - Task Management Routes
**Base URL**: `/api/tasks`

**Task CRUD Routes:**
- POST `/` - Create task (Parent/Spouse)
- GET `/` - Get all tasks (with filters)
- GET `/:taskId` - Get task by ID
- PUT `/:taskId` - Update task (Parent/Spouse)
- DELETE `/:taskId` - Delete task (Parent/Spouse)
- PATCH `/:taskId/status` - Update task status

**Task Query Routes:**
- GET `/family/:familyId` - Get family tasks
- GET `/family/:familyId/active` - Get active tasks
- GET `/family/:familyId/recurring` - Get recurring tasks
- POST `/:taskId/duplicate` - Duplicate task
- GET `/statistics/:familyId` - Get task statistics

---

### 5. **assignment.routes.js** - Task Assignment Routes
**Base URL**: `/api/assignments`

**Assignment Management:**
- POST `/` - Assign task (Parent/Spouse)
- GET `/` - Get assignments (with filters)
- GET `/:assignmentId` - Get assignment by ID
- GET `/child/:childId` - Get child's assignments
- GET `/task/:taskId` - Get task assignments
- DELETE `/:assignmentId` - Delete assignment (Parent/Spouse)

**Child Actions:**
- PATCH `/:assignmentId/start` - Start task (Child)
- POST `/:assignmentId/submit` - Submit task (Child)
- GET `/:assignmentId/submissions` - Get submissions
- POST `/:assignmentId/resubmit` - Resubmit task (Child)

**Parent Review:**
- POST `/:assignmentId/review` - Review submission (Parent/Spouse)
- GET `/pending-review/:familyId` - Get pending reviews
- GET `/overdue/:familyId` - Get overdue assignments
- PATCH `/:assignmentId/extend-deadline` - Extend deadline

**Statistics:**
- GET `/statistics/child/:childId` - Child statistics
- GET `/statistics/family/:familyId` - Family statistics

---

### 6. **reward.routes.js** - Reward Management Routes
**Base URL**: `/api/rewards`

**Reward CRUD Routes:**
- POST `/` - Create reward (Parent/Spouse)
- GET `/` - Get all rewards (with filters)
- GET `/:rewardId` - Get reward by ID
- PUT `/:rewardId` - Update reward (Parent/Spouse)
- DELETE `/:rewardId` - Delete reward (Parent/Spouse)
- PATCH `/:rewardId/status` - Update reward status

**Image Management:**
- POST `/:rewardId/image` - Upload reward image
- DELETE `/:rewardId/image` - Delete reward image

**Reward Catalog:**
- GET `/family/:familyId` - Get family rewards
- GET `/family/:familyId/available` - Get available rewards
- GET `/family/:familyId/child/:childId` - Get affordable rewards

**Statistics:**
- GET `/statistics/:familyId` - Get reward statistics

---

### 7. **redemption.routes.js** - Reward Redemption Routes
**Base URL**: `/api/redemptions`

**Child Redemption:**
- POST `/` - Request redemption (Child)
- GET `/my-requests` - Get my redemptions (Child)
- PATCH `/:redemptionId/cancel` - Cancel redemption (Child)

**Parent Review:**
- GET `/` - Get all redemptions (Parent/Spouse)
- GET `/:redemptionId` - Get redemption by ID
- POST `/:redemptionId/review` - Review redemption (Parent/Spouse)
- GET `/pending/:familyId` - Get pending redemptions

**History:**
- GET `/family/:familyId` - Get family redemptions
- GET `/child/:childId` - Get child redemptions
- GET `/reward/:rewardId` - Get reward redemptions

**Statistics:**
- GET `/statistics/child/:childId` - Child redemption stats
- GET `/statistics/family/:familyId` - Family redemption stats

---

### 8. **notification.routes.js** - Notification Routes
**Base URL**: `/api/notifications`

**Retrieval:**
- GET `/` - Get all notifications
- GET `/unread` - Get unread notifications
- GET `/count` - Get unread count
- GET `/:notificationId` - Get notification by ID

**Management:**
- PATCH `/:notificationId/read` - Mark as read
- PATCH `/read-all` - Mark all as read
- DELETE `/:notificationId` - Delete notification
- DELETE `/` - Delete all notifications
- DELETE `/read/clear` - Clear read notifications

**Settings:**
- GET `/settings/preferences` - Get notification settings
- PUT `/settings/preferences` - Update settings

**History:**
- GET `/history/all` - Get notification history
- GET `/by-type/:type` - Get by type

---

### 9. **points.routes.js** - Points Management Routes
**Base URL**: `/api/points`

**Balance:**
- GET `/balance` - Get my balance (Child)
- GET `/balance/:childId` - Get child balance
- GET `/family/:familyId/balances` - Get family balances

**History:**
- GET `/history` - Get my history (Child)
- GET `/history/:childId` - Get child history
- GET `/family/:familyId/history` - Get family history
- GET `/transaction/:logId` - Get transaction by ID

**Manual Adjustments (Parent/Spouse):**
- POST `/adjust` - Adjust points
- POST `/bonus` - Award bonus
- POST `/penalty` - Deduct penalty

**Statistics:**
- GET `/statistics/:childId` - Child points stats
- GET `/statistics/family/:familyId` - Family points stats
- GET `/leaderboard/:familyId` - Family leaderboard
- GET `/earned/:childId` - Total earned
- GET `/spent/:childId` - Total spent

---

### 10. **report.routes.js** - Analytics & Reports Routes
**Base URL**: `/api/reports`

**Child Performance:**
- GET `/child-performance/:childId` - Performance report
- GET `/child-performance/:childId/summary` - Performance summary
- GET `/child-performance/:childId/trends` - Performance trends

**Task Analytics:**
- GET `/task-analytics/:familyId` - Task analytics
- GET `/task-completion/:familyId` - Completion rate
- GET `/task-categories/:familyId` - Category distribution
- GET `/overdue-tasks/:familyId` - Overdue tasks

**Reward Reports:**
- GET `/reward-redemptions/:familyId` - Redemption report
- GET `/popular-rewards/:familyId` - Popular rewards
- GET `/reward-trends/:familyId` - Reward trends

**Family Activity:**
- GET `/family-summary/:familyId` - Family summary
- GET `/family-dashboard/:familyId` - Dashboard data
- GET `/family-engagement/:familyId` - Engagement metrics

**Parent Activity:**
- GET `/parent-activity/:familyId` - Parent activity
- GET `/parent-activity/:parentId/summary` - Parent summary

**Points Analytics:**
- GET `/points-distribution/:familyId` - Points distribution
- GET `/points-trends/:childId` - Points trends

**Comparative:**
- GET `/compare-children/:familyId` - Compare children
- GET `/period-comparison/:familyId` - Compare periods

**Export (Future):**
- GET `/export/:familyId/pdf` - Export as PDF
- GET `/export/:familyId/csv` - Export as CSV

---

## Total Route Count

| Route File | Public Routes | Protected Routes | Total |
|------------|---------------|------------------|-------|
| auth.routes.js | 6 | 4 | 10 |
| user.routes.js | 0 | 9 | 9 |
| family.routes.js | 0 | 14 | 14 |
| task.routes.js | 0 | 11 | 11 |
| assignment.routes.js | 0 | 16 | 16 |
| reward.routes.js | 0 | 12 | 12 |
| redemption.routes.js | 0 | 13 | 13 |
| notification.routes.js | 0 | 13 | 13 |
| points.routes.js | 0 | 15 | 15 |
| report.routes.js | 0 | 21 | 21 |
| **TOTAL** | **6** | **128** | **134** |

---

## Authentication & Authorization

### Authentication Levels:
1. **Public** - No authentication required
2. **Private** - JWT authentication required
3. **Role-Based** - Specific roles required (Admin, Parent, Spouse, Child)

### Middleware Used:
- `authenticate` - Verifies JWT token
- `requireRole(['role1', 'role2'])` - Checks user role
- `upload.single()` - Handles file uploads
- `validate*` - Validates request data

---

## Next Steps

Now that all routes are created, we need to create:

1. ✅ **Routes** (COMPLETED)
2. ⏳ **Middleware** (Next)
3. ⏳ **Controllers**
4. ⏳ **Services**
5. ⏳ **Utils**
6. ⏳ **Integration in app.js**

---

**Created**: January 2026
**Author**: Souleymane Camara - BIT1007326
**Project**: TaskBuddy - Phase 3 Development
