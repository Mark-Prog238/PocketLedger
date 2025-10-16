#!/bin/bash

# PocketLedger Setup Script
echo "🚀 Setting up PocketLedger..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL is not installed. Please install MySQL to continue."
    print_warning "You can install it from: https://dev.mysql.com/downloads/mysql/"
fi

print_status "Node.js is installed"

# Setup Backend
echo "📦 Setting up backend..."
cd pb_backend

# Install backend dependencies
if npm install; then
    print_status "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp env.example .env
    print_status "Created .env file from template"
    print_warning "Please edit pb_backend/.env with your database credentials"
else
    print_status ".env file already exists"
fi

cd ..

# Setup Frontend
echo "📱 Setting up mobile app..."
cd ap

# Install frontend dependencies
if npm install; then
    print_status "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

print_status "Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your MySQL database:"
echo "   - Create a database named 'pocketledger'"
echo "   - Run: mysql -u your_username -p pocketledger < database_schema.sql"
echo ""
echo "2. Configure your environment:"
echo "   - Edit pb_backend/.env with your database credentials"
echo "   - Update ap/config/api.ts with your server IP address"
echo ""
echo "3. Start the backend server:"
echo "   cd pb_backend && npm run dev"
echo ""
echo "4. Start the mobile app:"
echo "   cd ap && npm start"
echo ""
echo "🎉 Happy coding!"
