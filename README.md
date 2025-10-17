# 💰 PocketLedger - Personal Finance Manager

A modern, cross-platform personal finance management app built with React Native and Expo. Track your expenses, manage budgets, and gain insights into your spending habits with a beautiful, intuitive interface.

## ✨ Features

### 📱 Cross-Platform

- **Mobile**: Native iOS and Android support with swipe navigation
- **Web**: Responsive web interface with desktop-optimized layout
- **Consistent UI**: Unified design language across all platforms

### 💳 Core Functionality

- **Transaction Management**: Add, edit, and categorize income and expenses
- **Smart Categories**: Create custom categories with icons and colors
- **Transaction History**: View and search through all your transactions
- **Budget Tracking**: Set and monitor spending limits
- **Analytics & Reports**: Visual insights into your financial patterns
- **User Profiles**: Secure authentication and profile management

### 🎨 Modern Design

- **Dark Theme**: Easy on the eyes with a sleek dark interface
- **Glass Morphism**: Beautiful frosted glass effects
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Responsive Layout**: Adapts perfectly to any screen size

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- MySQL database

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mark-Prog238/PocketLedger
   cd PocketLedger-mobile_app
   ```

2. **Install dependencies**

   ```bash
   # Frontend
   cd ap
   npm install

   # Backend
   cd ../pb_backend
   npm install
   ```

3. **Database Setup**

   ```bash
   # Run the database setup script
   ./setup.sh
   ```

4. **Environment Configuration**

   ```bash
   # Backend environment
   cd pb_backend
   cp env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the application**

   ```bash
   # Start backend server
   cd pb_backend
   npm run dev

   # Start frontend (in new terminal)
   cd ap
   npm start
   ```

## 🏗️ Project Structure

```
PocketLedger-mobile_app/
├── ap/                          # React Native frontend
│   ├── components/              # Reusable UI components
│   │   ├── parts/              # Screen components
│   │   │   ├── CreateTransaction.tsx
│   │   │   ├── TransactionHistory.tsx
│   │   │   ├── AnalyticsReports.tsx
│   │   │   ├── BudgetScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── OnboardingFlow.tsx  # User onboarding
│   │   ├── CustomNavBar.tsx    # Bottom navigation
│   │   └── SwipeableContainer.tsx
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication state
│   ├── config/                 # Configuration
│   │   └── api.ts             # API endpoints
│   └── App.tsx                 # Main app component
├── pb_backend/                 # Node.js backend
│   ├── server.ts              # Express server
│   └── package.json
├── database_schema.sql         # Database structure
├── setup.sh                   # Database setup script
└── README.md
```

## 🛠️ Technology Stack

### Frontend

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **React Navigation** - Navigation library
- **AsyncStorage** - Local data persistence

### Backend

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

## 📱 Screenshots

### Onboarding Experience

![Welcome Screen](screenshots/welcome-screen.png)
_Welcome to PocketLedger - Your personal finance companion_

### Authentication

![Login Screen](screenshots/login-screen.png)
_Secure login with modern dark theme design_

### Main Features

_Additional screenshots of the main app features will be added here_

## 🔧 Development

### Available Scripts

```bash
# Frontend
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
npm run web        # Run web version

# Backend
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
```

### Database Schema

The app uses a MySQL database with the following main tables:

- `users` - User accounts and authentication
- `transactions` - Financial transactions
- `tags` - Custom categories for transactions
- `budgets` - User budget settings

See `database_schema.sql` for the complete schema.

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Input Validation** - Server-side validation
- **SQL Injection Prevention** - Parameterized queries
- **CORS Protection** - Cross-origin request security

## 🚀 Deployment

### Mobile App

1. Build for production: `expo build`
2. Submit to app stores using Expo Application Services (EAS)

### Web App

1. Build static files: `expo export:web`
2. Deploy to any static hosting service (Vercel, Netlify, etc.)

### Backend

1. Deploy to cloud provider (AWS, DigitalOcean, etc.)
2. Set up MySQL database
3. Configure environment variables
4. Start production server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- React Native community for excellent libraries
- Tailwind CSS for beautiful styling utilities

---

**Built with ❤️ for better financial management**
