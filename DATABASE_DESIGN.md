# TaskBuddy Database Design Documentation

## Overview
This document describes the database architecture for TaskBuddy, a web-based family activity planning system. The database uses PostgreSQL and implements a relational model optimized for family collaboration, task management, and reward systems.

---

## Database Design Principles

### 1. Normalization
The database follows Third Normal Form (3NF) to:
- Eliminate data redundancy
- Ensure data integrity
- Optimize update operations
- Maintain consistency

### 2. Security Considerations
- Passwords stored as bcrypt hashes
- Role-based access control (RBAC)
- Cascade delete operations for data integrity
- Email verification system

### 3. Performance Optimization
- Strategic indexing on frequently queried columns
- Views for complex common queries
- Efficient foreign key relationships
- Timestamp tracking for audit trails

---

## Entity Relationship Overview

### Core Entities
1. **Users** - All system users (Admin, Parent, Spouse, Child)
2. **Families** - Family groupings
3. **Family Members** - User-family relationships
4. **Tasks** - Task definitions
5. **Task Assignments** - Task-child assignments
6. **Task Submissions** - Photo uploads and completion records
7. **Rewards** - Reward catalog
8. **Reward Redemptions** - Redemption requests
9. **Points Log** - Points transaction history
10. **Notifications** - System notifications

---

## Detailed Table Specifications

### 1. USERS Table
**Purpose**: Central authentication and user profile storage

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | SERIAL | PRIMARY KEY | Auto-incrementing user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email for login |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| full_name | VARCHAR(255) | NOT NULL | User's full name |
| role | VARCHAR(20) | NOT NULL, CHECK | User role: admin, parent, spouse, child |
| profile_picture | VARCHAR(500) | NULL | URL to profile image |
| date_of_birth | DATE | NULL | User's birth date |
| phone_number | VARCHAR(20) | NULL | Contact number |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| created_at | TIMESTAMP | DEFAULT NOW | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last profile update |
| last_login | TIMESTAMP | NULL | Last login timestamp |

**Indexes**:
- `idx_users_email` on email (for login lookups)
- `idx_users_role` on role (for role-based queries)

**Business Rules**:
- Email must be unique across the system
- Role must be one of: 'admin', 'parent', 'spouse', 'child'
- Password must be hashed before storage (never store plaintext)
- Email verification required before full access

---

### 2. FAMILIES Table
**Purpose**: Family group management and organization

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| family_id | SERIAL | PRIMARY KEY | Auto-incrementing family identifier |
| family_name | VARCHAR(255) | NOT NULL | Display name for the family |
| created_by | INTEGER | FK to users, NOT NULL | Parent who created the family |
| family_code | VARCHAR(10) | UNIQUE, NOT NULL | Unique joining code |
| is_active | BOOLEAN | DEFAULT TRUE | Family account status |
| created_at | TIMESTAMP | DEFAULT NOW | Family creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update time |

**Indexes**:
- `idx_families_code` on family_code (for family joining)

**Business Rules**:
- Family code must be unique (used for inviting family members)
- Only users with 'parent' role can create families
- Family code generation should be random and memorable (e.g., "DOE2026")

---

### 3. FAMILY_MEMBERS Table
**Purpose**: Links users to families and tracks points balance

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| member_id | SERIAL | PRIMARY KEY | Member relationship identifier |
| family_id | INTEGER | FK to families, NOT NULL | Family association |
| user_id | INTEGER | FK to users, NOT NULL | User association |
| relationship | VARCHAR(20) | NOT NULL, CHECK | Family role |
| points_balance | INTEGER | DEFAULT 0, CHECK >= 0 | Current points balance |
| joined_at | TIMESTAMP | DEFAULT NOW | When user joined family |
| is_active | BOOLEAN | DEFAULT TRUE | Membership status |

**Indexes**:
- `idx_family_members_family` on family_id
- `idx_family_members_user` on user_id
- UNIQUE constraint on (family_id, user_id)

**Business Rules**:
- One user can belong to multiple families
- Points balance cannot be negative
- Relationship must be: 'parent', 'spouse', or 'child'
- Only children accumulate points

---

### 4. TASKS Table
**Purpose**: Stores task definitions and specifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| task_id | SERIAL | PRIMARY KEY | Task identifier |
| family_id | INTEGER | FK to families, NOT NULL | Family association |
| created_by | INTEGER | FK to users, NOT NULL | Parent/spouse who created task |
| title | VARCHAR(255) | NOT NULL | Task title |
| description | TEXT | NULL | Detailed task description |
| category | VARCHAR(100) | NULL | Task category (e.g., "Chores", "Homework") |
| tags | VARCHAR(255) | NULL | Comma-separated tags |
| priority | VARCHAR(20) | DEFAULT 'medium', CHECK | Task priority level |
| points_reward | INTEGER | NOT NULL, CHECK > 0 | Points awarded upon completion |
| photo_required | BOOLEAN | DEFAULT FALSE | Photo verification required |
| deadline | TIMESTAMP | NULL | Task deadline |
| is_recurring | BOOLEAN | DEFAULT FALSE | Recurring task flag |
| recurrence_pattern | VARCHAR(50) | NULL | Pattern: 'daily', 'weekly', 'monthly' |
| recurrence_days | VARCHAR(50) | NULL | Days for weekly recurrence |
| status | VARCHAR(20) | DEFAULT 'active', CHECK | Task status |
| created_at | TIMESTAMP | DEFAULT NOW | Task creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last modification time |

**Indexes**:
- `idx_tasks_family` on family_id
- `idx_tasks_status` on status
- `idx_tasks_deadline` on deadline

**Business Rules**:
- Priority must be: 'low', 'medium', 'high', or 'urgent'
- Points reward must be positive
- Status must be: 'active', 'inactive', or 'archived'
- Recurring tasks require recurrence_pattern
- Only parent or spouse can create tasks

---

### 5. TASK_ASSIGNMENTS Table
**Purpose**: Links tasks to children and tracks completion status

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| assignment_id | SERIAL | PRIMARY KEY | Assignment identifier |
| task_id | INTEGER | FK to tasks, NOT NULL | Task reference |
| assigned_to | INTEGER | FK to users, NOT NULL | Child assigned |
| assigned_by | INTEGER | FK to users, NOT NULL | Parent who assigned |
| status | VARCHAR(30) | DEFAULT 'pending', CHECK | Current status |
| assigned_at | TIMESTAMP | DEFAULT NOW | Assignment time |
| started_at | TIMESTAMP | NULL | When child started task |
| completed_at | TIMESTAMP | NULL | When child completed task |
| reviewed_at | TIMESTAMP | NULL | When parent reviewed |
| reviewed_by | INTEGER | FK to users, NULL | Parent who reviewed |
| review_comments | TEXT | NULL | Review feedback |
| due_date | TIMESTAMP | NULL | Assignment-specific deadline |
| reminder_sent | BOOLEAN | DEFAULT FALSE | Reminder email sent flag |

**Indexes**:
- `idx_assignments_task` on task_id
- `idx_assignments_child` on assigned_to
- `idx_assignments_status` on status
- `idx_assignments_due_date` on due_date

**Business Rules**:
- Status values: 'pending', 'in_progress', 'pending_review', 'approved', 'rejected', 'overdue'
- Assigned_to must have 'child' role
- Same task can be assigned multiple times to same child
- Status transitions:
  - pending → in_progress (child starts)
  - in_progress → pending_review (child submits)
  - pending_review → approved/rejected (parent reviews)
  - rejected → pending (child can resubmit)

---

### 6. TASK_SUBMISSIONS Table
**Purpose**: Stores photo evidence and submission details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| submission_id | SERIAL | PRIMARY KEY | Submission identifier |
| assignment_id | INTEGER | FK to task_assignments, NOT NULL | Assignment reference |
| photo_url | VARCHAR(500) | NULL | URL to uploaded photo |
| submission_notes | TEXT | NULL | Child's notes about completion |
| submitted_at | TIMESTAMP | DEFAULT NOW | Submission time |
| is_latest | BOOLEAN | DEFAULT TRUE | Latest submission flag |

**Indexes**:
- `idx_submissions_assignment` on assignment_id

**Business Rules**:
- Multiple submissions allowed for same assignment (resubmissions)
- Only the latest submission is marked as is_latest = TRUE
- Photo_url required if task has photo_required = TRUE

---

### 7. REWARDS Table
**Purpose**: Catalog of available rewards

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| reward_id | SERIAL | PRIMARY KEY | Reward identifier |
| family_id | INTEGER | FK to families, NOT NULL | Family association |
| created_by | INTEGER | FK to users, NOT NULL | Parent who created reward |
| reward_name | VARCHAR(255) | NOT NULL | Reward title |
| description | TEXT | NULL | Reward description |
| points_required | INTEGER | NOT NULL, CHECK > 0 | Points cost |
| quantity_available | INTEGER | DEFAULT 1 | Available quantity |
| quantity_redeemed | INTEGER | DEFAULT 0, CHECK >= 0 | Redeemed count |
| reward_image | VARCHAR(500) | NULL | Reward image URL |
| status | VARCHAR(20) | DEFAULT 'available', CHECK | Availability status |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update time |

**Indexes**:
- `idx_rewards_family` on family_id
- `idx_rewards_status` on status

**Business Rules**:
- Points required must be positive
- Status must be: 'available', 'unavailable', or 'archived'
- Quantity_redeemed cannot exceed quantity_available
- Only parent or spouse can create rewards

---

### 8. REWARD_REDEMPTIONS Table
**Purpose**: Tracks reward redemption requests

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| redemption_id | SERIAL | PRIMARY KEY | Redemption identifier |
| reward_id | INTEGER | FK to rewards, NOT NULL | Reward reference |
| child_id | INTEGER | FK to users, NOT NULL | Child requesting |
| family_id | INTEGER | FK to families, NOT NULL | Family association |
| points_spent | INTEGER | NOT NULL | Points deducted |
| status | VARCHAR(20) | DEFAULT 'pending', CHECK | Request status |
| requested_at | TIMESTAMP | DEFAULT NOW | Request time |
| reviewed_at | TIMESTAMP | NULL | Review time |
| reviewed_by | INTEGER | FK to users, NULL | Parent who reviewed |
| review_notes | TEXT | NULL | Review comments |

**Indexes**:
- `idx_redemptions_child` on child_id
- `idx_redemptions_reward` on reward_id
- `idx_redemptions_status` on status

**Business Rules**:
- Status must be: 'pending', 'approved', 'denied', or 'cancelled'
- Child must have sufficient points balance
- Points deducted only upon approval
- Only parent or spouse can approve/deny

---

### 9. POINTS_LOG Table
**Purpose**: Audit trail for all points transactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| log_id | SERIAL | PRIMARY KEY | Log entry identifier |
| family_member_id | INTEGER | FK to family_members, NOT NULL | Member reference |
| transaction_type | VARCHAR(20) | NOT NULL, CHECK | Transaction type |
| points_amount | INTEGER | NOT NULL | Points amount (+ or -) |
| reference_type | VARCHAR(20) | NULL | Reference category |
| reference_id | INTEGER | NULL | Referenced entity ID |
| description | TEXT | NULL | Transaction description |
| created_at | TIMESTAMP | DEFAULT NOW | Transaction time |
| created_by | INTEGER | FK to users, NULL | User who initiated |

**Indexes**:
- `idx_points_log_member` on family_member_id
- `idx_points_log_type` on transaction_type
- `idx_points_log_date` on created_at

**Business Rules**:
- Transaction_type must be: 'earned', 'spent', or 'adjusted'
- Reference_type examples: 'task', 'reward', 'manual'
- Positive amounts for earning, negative for spending
- Maintains complete audit trail

---

### 10. NOTIFICATIONS Table
**Purpose**: In-app and email notification storage

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| notification_id | SERIAL | PRIMARY KEY | Notification identifier |
| user_id | INTEGER | FK to users, NOT NULL | Recipient user |
| notification_type | VARCHAR(50) | NOT NULL, CHECK | Notification category |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification body |
| reference_type | VARCHAR(20) | NULL | Related entity type |
| reference_id | INTEGER | NULL | Related entity ID |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| sent_via_email | BOOLEAN | DEFAULT FALSE | Email sent flag |
| created_at | TIMESTAMP | DEFAULT NOW | Notification time |
| read_at | TIMESTAMP | NULL | Time when read |

**Indexes**:
- `idx_notifications_user` on user_id
- `idx_notifications_read` on is_read
- `idx_notifications_type` on notification_type
- `idx_notifications_date` on created_at

**Business Rules**:
- Notification types include:
  - task_assigned, deadline_reminder, task_overdue
  - task_submitted, task_approved, task_rejected
  - reward_requested, reward_approved, reward_denied
  - points_earned, general
- Both in-app and email notifications supported

---

## Database Views

### v_active_tasks_summary
Provides summary of active tasks with assignment statistics
```sql
SELECT task details, assignment counts, completion rates
FROM tasks with assignments
WHERE status = 'active'
```

### v_child_performance
Aggregates child performance metrics
```sql
SELECT child details, points, tasks completed/rejected/overdue
FROM family_members with task_assignments
WHERE role = 'child'
```

---

## Data Integrity & Constraints

### Foreign Key Cascades
- ON DELETE CASCADE: When parent record deleted, child records auto-delete
- Applies to family deletion (removes all related data)
- User deletion (removes all user-related data)

### Check Constraints
- Points balances >= 0
- Points rewards > 0
- Status enumerations enforced
- Quantity validations

### Unique Constraints
- Email addresses (global uniqueness)
- Family codes (for joining)
- User-family relationships

---

## Triggers & Functions

### update_updated_at_column()
Automatically updates the `updated_at` timestamp on row modifications
Applied to: users, families, tasks, rewards

---

## Security Considerations

1. **Password Storage**: Never store plaintext passwords
2. **Role Validation**: Enforce role checks at application layer
3. **SQL Injection**: Use parameterized queries
4. **Data Access**: Implement row-level security if needed
5. **Audit Trail**: Points_log provides complete transaction history

---

## Performance Optimization

1. **Strategic Indexes**: On frequently queried columns
2. **Views**: Pre-computed complex queries
3. **Efficient Joins**: Proper foreign key relationships
4. **Timestamp Tracking**: Enables time-based queries

---

## Backup & Maintenance

### Recommended Practices
- Daily automated backups
- Weekly full database dumps
- Transaction log archiving
- Regular VACUUM operations
- Index maintenance and analysis

---

## Migration & Version Control

### Schema Versioning
- Use migration tools (e.g., Flyway, Liquibase)
- Version-controlled SQL scripts
- Rollback capabilities
- Testing on staging environment

---

## Scalability Considerations

### Future Enhancements
- Partitioning large tables (notifications, points_log)
- Read replicas for reporting
- Caching frequently accessed data
- Archive old data periodically

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Author**: Souleymane Camara - BIT1007326  
**Institution**: Regional Maritime University
