# Education-prime

A comprehensive MERN stack application for learning Khmer (Cambodian) language with interactive features including learning paths, vocabulary translation, AI chatbot, and quizzes.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Authentication**: Secure login and registration system with JWT tokens
- **Learning Paths**: Structured learning paths for Beginner, Intermediate, and Advanced levels
- **Vocabulary Learning**: Word translation and detailed word information
- **AI Chatbot**: Conversational AI assistant for translation and language practice
- **Interactive Quizzes**: Test your knowledge with engaging quizzes
- **Admin Dashboard**: Manage users, categories, and content
- **Category Management**: Organize learning content by categories
- **Responsive Design**: Modern UI built with Tailwind CSS and Framer Motion

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Express Validator** - Input validation

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas account)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd own-project
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## 🔐 Environment Variables

### Backend (.env)
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=

# Database
MONGODB_URI=
# Or for MongoDB Atlas:
# MONGODB_URI=

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Mailtrap (for email sending)
MAILTRAP_API_KEY=your-mailtrap-api-key
MAILTRAP_ENDPOINT=https://send.api.mailtrap.io/api/send

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### Frontend (.env)
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## ▶️ Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm run server
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend in production mode**
   ```bash
   cd backend
   npm start
   ```

## 📁 Project Structure

```
own-project/
├── backend/
│   ├── config/
│   │   ├── db.js              # Database configuration
│   │   └── server.js           # Server setup
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── categories.controller.js
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   ├── upload.js           # File upload middleware
│   │   └── validation.js       # Input validation
│   ├── models/
│   │   ├── User.js
│   │   └── Categories.js
│   ├── routes/
│   │   ├── auth.route.js
│   │   └── categories.route.js
│   ├── utils/
│   │   ├── helper.js
│   │   └── logError.js
│   └── uploads/                # Uploaded files
│
└── frontend/
    ├── src/
    │   ├── components/         # Reusable components
    │   │   ├── admin/
    │   │   ├── chatbot/
    │   │   ├── learning-path/
    │   │   ├── translator/
    │   │   └── word/
    │   ├── pages/              # Page components
    │   │   ├── admin/
    │   │   ├── auth/
    │   │   ├── dashboard/
    │   │   └── learning-path/
    │   ├── store/              # Redux store
    │   │   └── slices/
    │   ├── config/             # Configuration files
    │   └── utils/              # Utility functions
    └── public/                 # Static assets
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- Thanks to all contributors who have helped improve this project

---

**Note**: Make sure to update the MongoDB connection string and JWT secret in your `.env` file before running the application.
