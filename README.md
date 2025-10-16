# PocketLedger - Mobile Finance App

A beautiful and modern mobile finance app built with React Native, Expo, and Node.js. Track your expenses, manage budgets, and gain insights into your spending habits.

## Features

- 📱 **Cross-platform**: Works on iOS, Android, and Web
- 💰 **Transaction Management**: Add income and expenses with categories
- 📊 **Analytics Dashboard**: Visualize your spending patterns
- 🎯 **Budget Tracking**: Create and monitor budgets
- 🏷️ **Custom Categories**: Create personalized spending categories
- 🔐 **Secure Authentication**: JWT-based authentication
- 📈 **Real-time Insights**: Track your financial health

## Tech Stack

### Frontend (Mobile App)

- React Native with Expo
- TypeScript
- NativeWind (Tailwind CSS for React Native)
- React Native Reanimated
- React Native Safe Area Context
- AsyncStorage for local storage

### Backend (API Server)

- Node.js with Express
- TypeScript
- MySQL database
- JWT authentication
- bcrypt for password hashing
- CORS enabled

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MySQL database
- Expo CLI (for mobile development)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Quick Start

### 1. Database Setup

1. Install MySQL and create a database:

```sql
CREATE DATABASE pocketledger;
```

2. Run the database schema:

```bash
mysql -u your_username -p pocketledger < database_schema.sql
```

### 2. Backend Setup

1. Navigate to the backend directory:

```bash
cd pb_backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp env.example .env
```

4. Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=pocketledger
API_PORT=8080
JWT_SECRET=your_super_secret_jwt_key_here
```

5. Start the backend server:

```bash
npm run dev
```

The API will be available at `http://localhost:8080`

### 3. Mobile App Setup

1. Navigate to the app directory:

```bash
cd ap
```

2. Install dependencies:

```bash
npm install
```

3. Update API configuration:
   Edit `config/api.ts` and update the `API_BASE_URL` to match your backend server IP address.

4. Start the development server:

```bash
npm start
```

5. Run on your preferred platform:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
PocketLedger-mobile_app/
├── ap/                          # React Native app
│   ├── components/              # React components
│   │   ├── parts/              # Screen components
│   │   │   ├── HomeAnalytics.tsx
│   │   │   ├── CreateTransaction.tsx
│   │   │   ├── BudgetScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ...
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx
│   ├── config/                 # Configuration
│   │   └── api.ts
│   └── App.tsx
├── pb_backend/                 # Node.js API server
│   ├── server.ts              # Main server file
│   ├── package.json
│   └── env.example
├── database_schema.sql         # Database schema
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Transactions

- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Analytics

- `GET /api/analytics` - Get spending analytics

### Tags/Categories

- `GET /api/tags/:userId` - Get user tags
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

### Budgets

- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create budget

### Profile

- `PUT /api/profile` - Update profile
- `PUT /api/change-password` - Change password

## Development

### Running Tests

```bash
# Backend tests
cd pb_backend
npm test

# Frontend tests
cd ap
npm test
```

### Building for Production

#### Mobile App

```bash
cd ap
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

#### Backend

```bash
cd pb_backend
npm run build
```

## Environment Variables

### Backend (.env)

- `DB_HOST` - Database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `API_PORT` - Server port
- `JWT_SECRET` - JWT secret key

### Frontend (config/api.ts)

- `API_BASE_URL` - Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@pocketledger.com or create an issue in the repository.

## Screenshots

[Add screenshots of your app here]

## Roadmap

- [ ] Dark/Light theme toggle
- [ ] Data export functionality
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Multi-currency support
- [ ] Recurring transactions
- [ ] Investment tracking
- [ ] Bill reminders
