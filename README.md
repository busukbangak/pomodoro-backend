# Pomodoro Backend API

A Node.js/Express API backend for the Pomodoro PWA, providing user authentication, statistics tracking, and settings management with MongoDB integration.

## ✨ Features

- 🔐 **JWT Authentication**: Secure user registration and login
- 📊 **Statistics API**: Track and retrieve pomodoro completion data
- ⚙️ **Settings Management**: User preferences and timer configurations
- 🔄 **Data Sync**: Synchronize local and server data
- 💾 **Backup & Restore**: Export/import user data
- 🛡️ **CORS Support**: Cross-origin resource sharing enabled
- 📝 **TypeScript**: Full type safety and better development experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB database (local or cloud)

### Installation
```bash
git clone <your-repo-url>
cd pomodoro-backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env:
# MONGODB_URI=mongodb://localhost:27017/pomodoro
# JWT_SECRET=your-super-secret-jwt-key
# PORT=5000

npm run dev
# API will be running at http://localhost:5000/api
```

## 🛠️ Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Project Structure
```
src/
├── index.ts           # Main server entry point
├── middleware/        # Express middleware
├── models/           # MongoDB models
└── routes/           # API routes
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Statistics
- `GET /api/stats/completed` - Get completed pomodoros count
- `GET /api/stats/completed/all` - Get all completed pomodoros
- `POST /api/stats/complete` - Record completed pomodoro
- `POST /api/stats/complete/bulk` - Add multiple pomodoros
- `POST /api/stats/reset` - Reset all completed pomodoros

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Save user settings

### Sync
- `GET /api/stats/sync` - Get all user data
- `POST /api/stats/sync` - Merge local data

### Backup
- `GET /api/stats/backup` - Export user data
- `POST /api/stats/backup` - Import user data

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | - | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | - | ✅ |
| `PORT` | Server port | `5000` | ❌ |

### MongoDB Setup

#### Local MongoDB
```bash
# Install MongoDB locally
# Set MONGODB_URI=mongodb://localhost:27017/pomodoro
```

#### MongoDB Atlas (Cloud)
1. Create account at [mongodb.com](https://mongodb.com)
2. Create a cluster
3. Get connection string
4. Set `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pomodoro`

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Set environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
5. Deploy!

## 🔒 Security

- **Password Hashing**: Uses bcryptjs for password hashing
- **JWT Tokens**: Secure token-based authentication
- **CORS**: Configured for cross-origin requests
- **Input Validation**: Validate all user inputs
- **Error Handling**: Proper error responses without sensitive data

---
