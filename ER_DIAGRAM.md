# TaskBuddy Entity Relationship Diagram

## ER Diagram Description

This document describes the entity relationships in the TaskBuddy database system.

---

## Entity Relationship Summary

### Core Relationships

#### 1. USERS ↔ FAMILIES (Many-to-Many through FAMILY_MEMBERS)
- A user can belong to multiple families
- A family can have multiple users
- Junction table: FAMILY_MEMBERS
- Relationship tracks: role, points_balance, join date

#### 2. FAMILIES ↔ TASKS (One-to-Many)
- A family has many tasks
- A task belongs to one family
- Relationship: family_id (FK in TASKS)

#### 3. TASKS ↔ TASK_ASSIGNMENTS (One-to-Many)
- A task can have multiple assignments (to different children or at different times)
- An assignment belongs to one task
- Relationship: task_id (FK in TASK_ASSIGNMENTS)

#### 4. USERS ↔ TASK_ASSIGNMENTS (One-to-Many)
- A child can have multiple task assignments
- An assignment is for one child
- Relationship: assigned_to (FK in TASK_ASSIGNMENTS)

#### 5. TASK_ASSIGNMENTS ↔ TASK_SUBMISSIONS (One-to-Many)
- An assignment can have multiple submissions (resubmissions)
- A submission belongs to one assignment
- Relationship: assignment_id (FK in TASK_SUBMISSIONS)

#### 6. FAMILIES ↔ REWARDS (One-to-Many)
- A family has many rewards
- A reward belongs to one family
- Relationship: family_id (FK in REWARDS)

#### 7. REWARDS ↔ REWARD_REDEMPTIONS (One-to-Many)
- A reward can have multiple redemption requests
- A redemption is for one reward
- Relationship: reward_id (FK in REWARD_REDEMPTIONS)

#### 8. USERS ↔ REWARD_REDEMPTIONS (One-to-Many)
- A child can have multiple redemption requests
- A redemption request is from one child
- Relationship: child_id (FK in REWARD_REDEMPTIONS)

#### 9. FAMILY_MEMBERS ↔ POINTS_LOG (One-to-Many)
- A family member has many point transactions
- A transaction belongs to one family member
- Relationship: family_member_id (FK in POINTS_LOG)

#### 10. USERS ↔ NOTIFICATIONS (One-to-Many)
- A user receives many notifications
- A notification is for one user
- Relationship: user_id (FK in NOTIFICATIONS)

---

## Cardinality Details

### Users Entity
- **One User** → **Many Family Memberships** (1:N)
- **One User** → **Many Tasks Created** (1:N)
- **One User** → **Many Task Assignments** (1:N)
- **One User** → **Many Reward Redemptions** (1:N)
- **One User** → **Many Notifications** (1:N)

### Families Entity
- **One Family** → **Many Members** (1:N)
- **One Family** → **Many Tasks** (1:N)
- **One Family** → **Many Rewards** (1:N)
- **One Family** → **Created by One User** (N:1)

### Tasks Entity
- **One Task** → **Many Assignments** (1:N)
- **One Task** → **Belongs to One Family** (N:1)
- **One Task** → **Created by One User** (N:1)

### Task Assignments Entity
- **One Assignment** → **Many Submissions** (1:N)
- **One Assignment** → **One Task** (N:1)
- **One Assignment** → **One Child (assigned_to)** (N:1)
- **One Assignment** → **One Parent (assigned_by)** (N:1)
- **One Assignment** → **One Reviewer (reviewed_by)** (N:1)

### Rewards Entity
- **One Reward** → **Many Redemptions** (1:N)
- **One Reward** → **Belongs to One Family** (N:1)
- **One Reward** → **Created by One User** (N:1)

---

## Key Attributes for Each Entity

### USERS
- **Primary Key**: user_id
- **Unique**: email
- **Key Attributes**: role, full_name, password_hash

### FAMILIES
- **Primary Key**: family_id
- **Unique**: family_code
- **Foreign Key**: created_by → users(user_id)

### FAMILY_MEMBERS
- **Primary Key**: member_id
- **Foreign Keys**: 
  - family_id → families(family_id)
  - user_id → users(user_id)
- **Key Attributes**: relationship, points_balance

### TASKS
- **Primary Key**: task_id
- **Foreign Keys**:
  - family_id → families(family_id)
  - created_by → users(user_id)
- **Key Attributes**: title, points_reward, deadline, status

### TASK_ASSIGNMENTS
- **Primary Key**: assignment_id
- **Foreign Keys**:
  - task_id → tasks(task_id)
  - assigned_to → users(user_id)
  - assigned_by → users(user_id)
  - reviewed_by → users(user_id)
- **Key Attributes**: status, due_date

### TASK_SUBMISSIONS
- **Primary Key**: submission_id
- **Foreign Key**: assignment_id → task_assignments(assignment_id)
- **Key Attributes**: photo_url, is_latest

### REWARDS
- **Primary Key**: reward_id
- **Foreign Keys**:
  - family_id → families(family_id)
  - created_by → users(user_id)
- **Key Attributes**: reward_name, points_required, status

### REWARD_REDEMPTIONS
- **Primary Key**: redemption_id
- **Foreign Keys**:
  - reward_id → rewards(reward_id)
  - child_id → users(user_id)
  - family_id → families(family_id)
  - reviewed_by → users(user_id)
- **Key Attributes**: points_spent, status

### POINTS_LOG
- **Primary Key**: log_id
- **Foreign Keys**:
  - family_member_id → family_members(member_id)
  - created_by → users(user_id)
- **Key Attributes**: transaction_type, points_amount

### NOTIFICATIONS
- **Primary Key**: notification_id
- **Foreign Key**: user_id → users(user_id)
- **Key Attributes**: notification_type, is_read

---

## Data Flow Diagrams

### Task Assignment Flow
```
USERS (parent) 
    ↓ creates
TASKS
    ↓ assigns to
TASK_ASSIGNMENTS (child)
    ↓ submits
TASK_SUBMISSIONS (photo)
    ↓ reviews
TASK_ASSIGNMENTS (approved/rejected)
    ↓ if approved
POINTS_LOG (points earned)
    ↓ updates
FAMILY_MEMBERS (points_balance)
```

### Reward Redemption Flow
```
USERS (child)
    ↓ requests
REWARD_REDEMPTIONS
    ↓ reviews
USERS (parent)
    ↓ if approved
POINTS_LOG (points spent)
    ↓ updates
FAMILY_MEMBERS (points_balance)
    ↓ updates
REWARDS (quantity_redeemed)
```

### Notification Flow
```
SYSTEM EVENT (task assigned, deadline, etc.)
    ↓ creates
NOTIFICATIONS (in-app)
    ↓ sends
EMAIL (via Nodemailer)
    ↓ updates
NOTIFICATIONS (sent_via_email = true)
```

---

## Database Normalization

### First Normal Form (1NF)
✓ All tables have atomic values
✓ No repeating groups
✓ Each cell contains single value

### Second Normal Form (2NF)
✓ Meets 1NF requirements
✓ All non-key attributes fully dependent on primary key
✓ No partial dependencies

### Third Normal Form (3NF)
✓ Meets 2NF requirements
✓ No transitive dependencies
✓ All non-key attributes depend only on primary key

---

## Referential Integrity

### CASCADE DELETE Rules
- Deleting a family → deletes all family members, tasks, rewards
- Deleting a user → deletes all their assignments, notifications
- Deleting a task → deletes all assignments and submissions
- Deleting an assignment → deletes all submissions

### ON UPDATE CASCADE
- Updating primary keys propagates to foreign keys
- Generally discouraged; use immutable primary keys

---

## Indexing Strategy

### Primary Indexes (Automatic)
- All PRIMARY KEY constraints create clustered indexes
- Ensures uniqueness and fast lookups

### Secondary Indexes (Created Manually)
- Email lookups (users.email)
- Role filtering (users.role)
- Family code joining (families.family_code)
- Task status queries (tasks.status)
- Assignment status tracking (task_assignments.status)
- Deadline monitoring (task_assignments.due_date)
- Notification filtering (notifications.is_read, notification_type)
- Points transaction history (points_log.created_at)

---

## ER Diagram Notation

### Symbols Used
- **Rectangle**: Entity
- **Diamond**: Relationship
- **Oval**: Attribute
- **Line**: Connection
- **Crow's Foot**: Many (1:N)
- **Single Line**: One (1:1)

### Relationship Types
- **1:1** - One-to-One
- **1:N** - One-to-Many
- **N:M** - Many-to-Many (requires junction table)

---

## Visual ER Diagram

```
                    USERS
                      |
        +-------------+-------------+
        |                           |
   FAMILY_MEMBERS              NOTIFICATIONS
        |
   FAMILIES -------- TASKS -------- TASK_ASSIGNMENTS -------- TASK_SUBMISSIONS
        |              |
        |              |
   REWARDS -------- REWARD_REDEMPTIONS
        |
   POINTS_LOG
```

### Detailed Relationships
```
USERS (1) ←→ (N) FAMILY_MEMBERS (N) ←→ (1) FAMILIES
FAMILIES (1) → (N) TASKS
USERS (1) → (N) TASKS (created_by)
TASKS (1) → (N) TASK_ASSIGNMENTS
USERS (1) → (N) TASK_ASSIGNMENTS (assigned_to, assigned_by, reviewed_by)
TASK_ASSIGNMENTS (1) → (N) TASK_SUBMISSIONS
FAMILIES (1) → (N) REWARDS
USERS (1) → (N) REWARDS (created_by)
REWARDS (1) → (N) REWARD_REDEMPTIONS
USERS (1) → (N) REWARD_REDEMPTIONS (child_id, reviewed_by)
FAMILY_MEMBERS (1) → (N) POINTS_LOG
USERS (1) → (N) NOTIFICATIONS
```

---

## Tools for Visualizing ER Diagrams

### Recommended Tools
1. **dbdiagram.io** - Online ER diagram tool
2. **draw.io** - Free diagramming tool
3. **Lucidchart** - Professional diagramming
4. **MySQL Workbench** - Database design tool
5. **pgModeler** - PostgreSQL-specific modeler

### Sample dbdiagram.io Code
```
Table users {
  user_id int [pk, increment]
  email varchar [unique, not null]
  role varchar [not null]
}

Table families {
  family_id int [pk, increment]
  created_by int [ref: > users.user_id]
}

Table family_members {
  member_id int [pk, increment]
  family_id int [ref: > families.family_id]
  user_id int [ref: > users.user_id]
  points_balance int
}

// ... continue for all tables
```

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Author**: Souleymane Camara - BIT1007326
