-- ============================================================================
-- TaskBuddy Database Schema
-- A Web-Based Family Activity Planning System
-- Author: Souleymane Camara - BIT1007326
-- Regional Maritime University
-- ============================================================================

-- Drop existing tables if they exist (for development only)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS points_log CASCADE;
DROP TABLE IF EXISTS reward_redemptions CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS task_submissions CASCADE;
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS families CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- USERS TABLE
-- Stores all user accounts: Admin, Parent, Spouse, Child
-- ============================================================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'parent', 'spouse', 'child')),
    profile_picture VARCHAR(500),
    date_of_birth DATE,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Index for faster user lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- FAMILIES TABLE
-- Stores family group information
-- ============================================================================
CREATE TABLE families (
    family_id SERIAL PRIMARY KEY,
    family_name VARCHAR(255) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    family_code VARCHAR(10) UNIQUE NOT NULL, -- Unique code for family joining
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for family code lookups
CREATE INDEX idx_families_code ON families(family_code);

-- ============================================================================
-- FAMILY_MEMBERS TABLE
-- Links users to families and defines relationships
-- ============================================================================
CREATE TABLE family_members (
    member_id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    relationship VARCHAR(20) NOT NULL CHECK (relationship IN ('parent', 'spouse', 'child')),
    points_balance INTEGER DEFAULT 0 CHECK (points_balance >= 0),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(family_id, user_id)
);

-- Indexes for family member lookups
CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);

-- ============================================================================
-- TASKS TABLE
-- Stores task definitions created by parents/spouses
-- ============================================================================
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags VARCHAR(255), -- Comma-separated tags
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    points_reward INTEGER NOT NULL CHECK (points_reward > 0),
    photo_required BOOLEAN DEFAULT FALSE,
    deadline TIMESTAMP,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50), -- e.g., 'daily', 'weekly', 'monthly'
    recurrence_days VARCHAR(50), -- For weekly: 'Mon,Wed,Fri'
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for task queries
CREATE INDEX idx_tasks_family ON tasks(family_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- ============================================================================
-- TASK_ASSIGNMENTS TABLE
-- Links tasks to specific children
-- ============================================================================
CREATE TABLE task_assignments (
    assignment_id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
    assigned_to INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_by INTEGER NOT NULL REFERENCES users(user_id),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'pending_review', 'approved', 'rejected', 'overdue'
    )),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(user_id),
    review_comments TEXT,
    due_date TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT FALSE,
    UNIQUE(task_id, assigned_to, assigned_at) -- Allow same task to be assigned multiple times to same child
);

-- Indexes for assignment queries
CREATE INDEX idx_assignments_task ON task_assignments(task_id);
CREATE INDEX idx_assignments_child ON task_assignments(assigned_to);
CREATE INDEX idx_assignments_status ON task_assignments(status);
CREATE INDEX idx_assignments_due_date ON task_assignments(due_date);

-- ============================================================================
-- TASK_SUBMISSIONS TABLE
-- Stores photo uploads and submission details
-- ============================================================================
CREATE TABLE task_submissions (
    submission_id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES task_assignments(assignment_id) ON DELETE CASCADE,
    photo_url VARCHAR(500),
    submission_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_latest BOOLEAN DEFAULT TRUE -- Track if this is the latest submission for resubmissions
);

-- Index for submission lookups
CREATE INDEX idx_submissions_assignment ON task_submissions(assignment_id);

-- ============================================================================
-- REWARDS TABLE
-- Stores rewards created by parents/spouses
-- ============================================================================
CREATE TABLE rewards (
    reward_id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    reward_name VARCHAR(255) NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL CHECK (points_required > 0),
    quantity_available INTEGER DEFAULT 1,
    quantity_redeemed INTEGER DEFAULT 0 CHECK (quantity_redeemed >= 0),
    reward_image VARCHAR(500),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'unavailable', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for reward queries
CREATE INDEX idx_rewards_family ON rewards(family_id);
CREATE INDEX idx_rewards_status ON rewards(status);

-- ============================================================================
-- REWARD_REDEMPTIONS TABLE
-- Tracks reward redemption requests and approvals
-- ============================================================================
CREATE TABLE reward_redemptions (
    redemption_id SERIAL PRIMARY KEY,
    reward_id INTEGER NOT NULL REFERENCES rewards(reward_id) ON DELETE CASCADE,
    child_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    family_id INTEGER NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
    points_spent INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(user_id),
    review_notes TEXT
);

-- Indexes for redemption queries
CREATE INDEX idx_redemptions_child ON reward_redemptions(child_id);
CREATE INDEX idx_redemptions_reward ON reward_redemptions(reward_id);
CREATE INDEX idx_redemptions_status ON reward_redemptions(status);

-- ============================================================================
-- POINTS_LOG TABLE
-- Tracks all points transactions for auditing
-- ============================================================================
CREATE TABLE points_log (
    log_id SERIAL PRIMARY KEY,
    family_member_id INTEGER NOT NULL REFERENCES family_members(member_id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'adjusted')),
    points_amount INTEGER NOT NULL,
    reference_type VARCHAR(20), -- 'task', 'reward', 'manual'
    reference_id INTEGER, -- ID of related task_assignment or reward_redemption
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(user_id)
);

-- Index for points log queries
CREATE INDEX idx_points_log_member ON points_log(family_member_id);
CREATE INDEX idx_points_log_type ON points_log(transaction_type);
CREATE INDEX idx_points_log_date ON points_log(created_at);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- Stores in-app and email notifications
-- ============================================================================
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'task_assigned', 'deadline_reminder', 'task_overdue', 'task_submitted',
        'task_approved', 'task_rejected', 'reward_requested', 'reward_approved',
        'reward_denied', 'points_earned', 'general'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR(20), -- 'task', 'reward', etc.
    reference_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    sent_via_email BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Indexes for notification queries
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_date ON notifications(created_at);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA FOR TESTING (Optional - Comment out for production)
-- ============================================================================

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role, is_active, email_verified)
VALUES ('admin@taskbuddy.com', '$2b$10$YourHashedPasswordHere', 'System Administrator', 'admin', TRUE, TRUE);

-- Insert sample parent user (password: parent123)
INSERT INTO users (email, password_hash, full_name, role, date_of_birth, is_active, email_verified)
VALUES ('parent@example.com', '$2b$10$YourHashedPasswordHere', 'John Doe', 'parent', '1985-05-15', TRUE, TRUE);

-- Create sample family
INSERT INTO families (family_name, created_by, family_code)
VALUES ('The Doe Family', 2, 'DOE2026');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Active tasks with assignment counts
CREATE OR REPLACE VIEW v_active_tasks_summary AS
SELECT 
    t.task_id,
    t.title,
    t.category,
    t.priority,
    t.points_reward,
    t.deadline,
    f.family_name,
    u.full_name AS created_by_name,
    COUNT(ta.assignment_id) AS total_assignments,
    COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS completed_assignments
FROM tasks t
JOIN families f ON t.family_id = f.family_id
JOIN users u ON t.created_by = u.user_id
LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
WHERE t.status = 'active'
GROUP BY t.task_id, t.title, t.category, t.priority, t.points_reward, t.deadline, f.family_name, u.full_name;

-- View: Child performance summary
CREATE OR REPLACE VIEW v_child_performance AS
SELECT 
    fm.family_id,
    u.user_id,
    u.full_name,
    fm.points_balance,
    COUNT(ta.assignment_id) AS total_tasks_assigned,
    COUNT(CASE WHEN ta.status = 'approved' THEN 1 END) AS tasks_completed,
    COUNT(CASE WHEN ta.status = 'rejected' THEN 1 END) AS tasks_rejected,
    COUNT(CASE WHEN ta.status = 'overdue' THEN 1 END) AS tasks_overdue,
    SUM(CASE WHEN ta.status = 'approved' THEN t.points_reward ELSE 0 END) AS total_points_earned
FROM family_members fm
JOIN users u ON fm.user_id = u.user_id
LEFT JOIN task_assignments ta ON u.user_id = ta.assigned_to
LEFT JOIN tasks t ON ta.task_id = t.task_id
WHERE u.role = 'child' AND fm.is_active = TRUE
GROUP BY fm.family_id, u.user_id, u.full_name, fm.points_balance;

-- ============================================================================
-- GRANT PERMISSIONS (Adjust according to your application user)
-- ============================================================================

-- Example: GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taskbuddy_app;
-- Example: GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO taskbuddy_app;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores all user accounts with role-based access control';
COMMENT ON TABLE families IS 'Family groupings for organizing household activities';
COMMENT ON TABLE tasks IS 'Task definitions created by parents/spouses';
COMMENT ON TABLE task_assignments IS 'Links tasks to children with status tracking';
COMMENT ON TABLE rewards IS 'Reward catalog available for points redemption';
COMMENT ON TABLE notifications IS 'In-app and email notifications for all users';
