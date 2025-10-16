-- PocketLedger Database Schema
-- This file contains the complete database schema for the PocketLedger mobile app

-- Create database
CREATE DATABASE IF NOT EXISTS pocketledger;
USE pocketledger;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tags table (both global and user-specific)
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL, -- NULL for global tags, user_id for custom tags
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    color VARCHAR(7) NULL, -- Hex color code
    icon VARCHAR(10) NULL, -- Emoji or icon
    is_default BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_slug (user_id, slug),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount_minor DECIMAL(15,2) NOT NULL, -- Amount in cents/minor units
    currency VARCHAR(3) DEFAULT 'USD',
    direction ENUM('income', 'expense') NOT NULL,
    description TEXT NOT NULL,
    merchant VARCHAR(255) NULL,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_occurred (user_id, occurred_at),
    INDEX idx_user_direction (user_id, direction)
);

-- Transaction tags junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS transaction_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_transaction_tag (transaction_id, tag_id)
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    spent DECIMAL(15,2) DEFAULT 0.00,
    period ENUM('weekly', 'monthly', 'yearly') DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_period (user_id, period, start_date)
);

-- Budget categories table (links budgets to tags)
CREATE TABLE IF NOT EXISTS budget_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    budget_id INT NOT NULL,
    tag_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    spent DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_budget_tag (budget_id, tag_id)
);

-- Insert default global tags
INSERT INTO tags (user_id, name, slug, color, icon, is_default) VALUES
(NULL, 'Food & Dining', 'food-dining', '#F59E0B', '🍽️', TRUE),
(NULL, 'Transportation', 'transportation', '#3B82F6', '🚗', TRUE),
(NULL, 'Bills & Utilities', 'bills-utilities', '#EF4444', '💡', TRUE),
(NULL, 'Shopping', 'shopping', '#EC4899', '🛍️', TRUE),
(NULL, 'Entertainment', 'entertainment', '#8B5CF6', '🎬', TRUE),
(NULL, 'Healthcare', 'healthcare', '#10B981', '⚕️', TRUE),
(NULL, 'Income', 'income', '#10B981', '💰', TRUE),
(NULL, 'Other', 'other', '#6B7280', '📝', TRUE);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, occurred_at DESC);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, direction);
CREATE INDEX idx_tags_user ON tags(user_id);
CREATE INDEX idx_budgets_user_active ON budgets(user_id, is_active);
