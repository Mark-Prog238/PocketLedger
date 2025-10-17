-- =====================================================
-- PocketLedger Database Setup Script
-- =====================================================
-- This script creates the complete database structure
-- for the PocketLedger personal finance management app
-- =====================================================

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS pocketledger;
-- USE pocketledger;

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Stores user account information and authentication data
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    profile_picture_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- TAGS TABLE
-- =====================================================
-- Stores custom categories/tags for transactions
CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL DEFAULT '💰',
    color VARCHAR(7) NOT NULL DEFAULT '#8B5CF6',
    description TEXT,
    is_income BOOLEAN DEFAULT FALSE,
    is_expense BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_name (name),
    INDEX idx_is_active (is_active),
    UNIQUE KEY unique_user_tag (user_id, name)
);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
-- Stores all financial transactions (income and expenses)
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tag_id INT,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    transaction_type ENUM('income', 'expense') NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency ENUM('daily', 'weekly', 'monthly', 'yearly') NULL,
    recurring_end_date DATE NULL,
    parent_transaction_id INT NULL,
    notes TEXT,
    location VARCHAR(255),
    payment_method ENUM('cash', 'card', 'bank_transfer', 'digital_wallet', 'other') DEFAULT 'card',
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_tag_id (tag_id),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_amount (amount),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
);

-- =====================================================
-- BUDGETS TABLE
-- =====================================================
-- Stores user budget settings and limits
CREATE TABLE IF NOT EXISTS budgets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tag_id INT,
    budget_name VARCHAR(100) NOT NULL,
    budget_amount DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0.00,
    budget_period ENUM('weekly', 'monthly', 'yearly') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    alert_threshold DECIMAL(5,2) DEFAULT 80.00,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_tag_id (tag_id),
    INDEX idx_budget_period (budget_period),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- GOALS TABLE
-- =====================================================
-- Stores financial goals and savings targets
CREATE TABLE IF NOT EXISTS goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    goal_name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    target_date DATE NOT NULL,
    goal_type ENUM('savings', 'debt_payoff', 'investment', 'purchase', 'other') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_goal_type (goal_type),
    INDEX idx_target_date (target_date),
    INDEX idx_is_completed (is_completed)
);

-- =====================================================
-- ACCOUNTS TABLE
-- =====================================================
-- Stores different financial accounts (bank, credit, etc.)
CREATE TABLE IF NOT EXISTS accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_type ENUM('checking', 'savings', 'credit_card', 'investment', 'cash', 'other') NOT NULL,
    bank_name VARCHAR(100),
    account_number_last_four VARCHAR(4),
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_account_type (account_type),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- SAMPLE DATA
-- =====================================================
-- Insert sample data for testing and demonstration

-- Sample user (password: 'password123' - hashed with bcrypt)
INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, onboarding_completed) VALUES
(1, 'demo@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo', 'User', TRUE);

-- Sample tags for the demo user
INSERT IGNORE INTO tags (id, user_id, name, icon, color, description, is_income, is_expense) VALUES
(1, 1, 'Food & Dining', '🍽️', '#FF6B6B', 'Restaurants, groceries, and food expenses', FALSE, TRUE),
(2, 1, 'Transportation', '🚗', '#4ECDC4', 'Gas, public transport, rideshare', FALSE, TRUE),
(3, 1, 'Entertainment', '🎬', '#45B7D1', 'Movies, games, subscriptions', FALSE, TRUE),
(4, 1, 'Shopping', '🛍️', '#96CEB4', 'Clothing, electronics, general shopping', FALSE, TRUE),
(5, 1, 'Bills & Utilities', '💡', '#FFEAA7', 'Electricity, water, internet, phone', FALSE, TRUE),
(6, 1, 'Healthcare', '🏥', '#DDA0DD', 'Medical expenses, pharmacy, insurance', FALSE, TRUE),
(7, 1, 'Salary', '💰', '#98D8C8', 'Monthly salary and wages', TRUE, FALSE),
(8, 1, 'Freelance', '💼', '#F7DC6F', 'Freelance work and side projects', TRUE, FALSE),
(9, 1, 'Investment', '📈', '#BB8FCE', 'Investment returns and dividends', TRUE, FALSE);

-- Sample transactions for the demo user
INSERT IGNORE INTO transactions (id, user_id, tag_id, amount, description, transaction_type, transaction_date, payment_method) VALUES
(1, 1, 1, 25.50, 'Lunch at Cafe Downtown', 'expense', '2024-01-15', 'card'),
(2, 1, 1, 85.30, 'Weekly Groceries', 'expense', '2024-01-14', 'card'),
(3, 1, 2, 45.00, 'Gas Station Fill-up', 'expense', '2024-01-13', 'card'),
(4, 1, 3, 12.99, 'Netflix Subscription', 'expense', '2024-01-12', 'card'),
(5, 1, 4, 120.00, 'New T-Shirt', 'expense', '2024-01-11', 'card'),
(6, 1, 5, 89.50, 'Electricity Bill', 'expense', '2024-01-10', 'bank_transfer'),
(7, 1, 7, 3500.00, 'Monthly Salary', 'income', '2024-01-01', 'bank_transfer'),
(8, 1, 8, 450.00, 'Freelance Web Design', 'income', '2024-01-08', 'bank_transfer'),
(9, 1, 1, 32.75, 'Dinner with Friends', 'expense', '2024-01-09', 'card'),
(10, 1, 2, 15.00, 'Uber Ride', 'expense', '2024-01-07', 'digital_wallet');

-- Sample budget for the demo user
INSERT IGNORE INTO budgets (id, user_id, tag_id, budget_name, budget_amount, spent_amount, budget_period, start_date, end_date) VALUES
(1, 1, 1, 'Food & Dining Budget', 500.00, 143.55, 'monthly', '2024-01-01', '2024-01-31'),
(2, 1, 2, 'Transportation Budget', 300.00, 60.00, 'monthly', '2024-01-01', '2024-01-31'),
(3, 1, 3, 'Entertainment Budget', 200.00, 12.99, 'monthly', '2024-01-01', '2024-01-31');

-- Sample financial goal
INSERT IGNORE INTO goals (id, user_id, goal_name, target_amount, current_amount, target_date, goal_type, description) VALUES
(1, 1, 'Emergency Fund', 10000.00, 2500.00, '2024-12-31', 'savings', 'Build emergency fund for 6 months of expenses'),
(2, 1, 'Vacation Fund', 3000.00, 800.00, '2024-06-30', 'savings', 'Save for summer vacation to Europe');

-- Sample account
INSERT IGNORE INTO accounts (id, user_id, account_name, account_type, bank_name, account_number_last_four, current_balance) VALUES
(1, 1, 'Main Checking', 'checking', 'Chase Bank', '1234', 2847.25),
(2, 1, 'Savings Account', 'savings', 'Chase Bank', '5678', 2500.00),
(3, 1, 'Credit Card', 'credit_card', 'Chase Bank', '9012', -450.75);

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================
-- Create views to simplify common queries

-- Monthly spending by category
CREATE OR REPLACE VIEW monthly_spending AS
SELECT 
    u.id as user_id,
    YEAR(t.transaction_date) as year,
    MONTH(t.transaction_date) as month,
    tg.name as category_name,
    tg.icon as category_icon,
    tg.color as category_color,
    SUM(t.amount) as total_amount,
    COUNT(t.id) as transaction_count
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id AND t.transaction_type = 'expense'
LEFT JOIN tags tg ON t.tag_id = tg.id
WHERE u.is_active = TRUE
GROUP BY u.id, YEAR(t.transaction_date), MONTH(t.transaction_date), tg.id, tg.name, tg.icon, tg.color;

-- User financial summary
CREATE OR REPLACE VIEW user_financial_summary AS
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) as net_worth,
    COUNT(CASE WHEN t.transaction_type = 'income' THEN t.id END) as income_transactions,
    COUNT(CASE WHEN t.transaction_type = 'expense' THEN t.id END) as expense_transactions
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.email, u.first_name, u.last_name;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================
-- Useful stored procedures for common operations

DELIMITER //

-- Procedure to get user's monthly spending summary
CREATE PROCEDURE GetMonthlySpending(IN user_id INT, IN year INT, IN month INT)
BEGIN
    SELECT 
        tg.name as category,
        tg.icon,
        tg.color,
        SUM(t.amount) as total,
        COUNT(t.id) as count
    FROM transactions t
    JOIN tags tg ON t.tag_id = tg.id
    WHERE t.user_id = user_id 
        AND t.transaction_type = 'expense'
        AND YEAR(t.transaction_date) = year
        AND MONTH(t.transaction_date) = month
    GROUP BY tg.id, tg.name, tg.icon, tg.color
    ORDER BY total DESC;
END //

-- Procedure to update budget spent amounts
CREATE PROCEDURE UpdateBudgetSpent(IN budget_id INT)
BEGIN
    DECLARE start_date DATE;
    DECLARE end_date DATE;
    DECLARE user_id INT;
    DECLARE tag_id INT;
    
    SELECT b.start_date, b.end_date, b.user_id, b.tag_id
    INTO start_date, end_date, user_id, tag_id
    FROM budgets b
    WHERE b.id = budget_id;
    
    UPDATE budgets 
    SET spent_amount = (
        SELECT COALESCE(SUM(t.amount), 0)
        FROM transactions t
        WHERE t.user_id = user_id
            AND t.tag_id = tag_id
            AND t.transaction_type = 'expense'
            AND t.transaction_date >= start_date
            AND t.transaction_date <= end_date
    )
    WHERE id = budget_id;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================
-- Automatic triggers for data consistency

-- Trigger to update budget spent amount when transaction is added
DELIMITER //
CREATE TRIGGER update_budget_on_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.transaction_type = 'expense' AND NEW.tag_id IS NOT NULL THEN
        UPDATE budgets 
        SET spent_amount = (
            SELECT COALESCE(SUM(t.amount), 0)
            FROM transactions t
            WHERE t.user_id = NEW.user_id
                AND t.tag_id = NEW.tag_id
                AND t.transaction_type = 'expense'
                AND t.transaction_date >= budgets.start_date
                AND t.transaction_date <= budgets.end_date
        )
        WHERE user_id = NEW.user_id 
            AND tag_id = NEW.tag_id 
            AND is_active = TRUE
            AND NEW.transaction_date >= start_date 
            AND NEW.transaction_date <= end_date;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
-- Additional indexes for better query performance

-- Composite indexes for common queries
CREATE INDEX idx_transactions_user_date_type ON transactions(user_id, transaction_date, transaction_type);
CREATE INDEX idx_transactions_user_tag_date ON transactions(user_id, tag_id, transaction_date);
CREATE INDEX idx_budgets_user_active ON budgets(user_id, is_active);
CREATE INDEX idx_goals_user_active ON goals(user_id, is_completed);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
SELECT 'PocketLedger database setup completed successfully!' as message;
SELECT 'Sample data has been inserted for testing.' as note;
SELECT 'You can now start the application and log in with demo@example.com / password123' as login_info;

