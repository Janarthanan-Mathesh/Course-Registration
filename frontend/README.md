# 📱 Course Registration App

A comprehensive mobile application for course registration and management built with React Native. This app allows students to register for academic and universal courses, track their progress, and manage certificates.

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [App Screenshots](#app-screenshots)
- [Database Schema](#database-schema)
- [API Endpoints (For Backend)](#api-endpoints-for-backend)
- [Future Enhancements](#future-enhancements)

---

## ✨ Features

### Authentication
- ✅ Login with Email/Password
- ✅ Register with email verification
- ✅ Google Sign-In integration
- ✅ Password visibility toggle
- ✅ Forgot Password functionality

### Home Dashboard
- ✅ Welcome message with username
- ✅ Statistics cards (Enrolled, Completed, Certificates)
- ✅ Quick action buttons
- ✅ Recently accessed courses
- ✅ Overall progress overview

### Course Management
- ✅ **Academic Courses**: Filtered by college email domain
- ✅ **Universal Courses**: Market courses (Udemy, Coursera, AWS, etc.)
- ✅ Course registration
- ✅ Progress tracking
- ✅ Certificate upload/management
- ✅ Wishlist functionality
- ✅ Search and filter options

### Dashboard
- ✅ View enrolled courses
- ✅ Track ongoing courses with progress bars
- ✅ View completed courses
- ✅ Certificate management
- ✅ Course statistics

### Profile Management
- ✅ Edit personal information
- ✅ Verified email and phone badges
- ✅ Social links (LinkedIn, GitHub)
- ✅ Password reset
- ✅ Account activity logs
- ✅ Logout functionality

---

## 🛠 Technology Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development and build tool
- **React Navigation** - Navigation library
- **React Native Paper** - UI component library
- **Expo Vector Icons** - Icon library

### Backend (To Be Implemented)
- **Node.js** with Express.js OR **Firebase**
- **JWT** for authentication
- **bcrypt** for password hashing

### Database Options
- **MySQL/PostgreSQL** (SQL schema provided)
- **MongoDB** (NoSQL schema provided)
- **Firestore** (Firebase - compatible with MongoDB schema)

---

## 📁 Project Structure

```
CourseRegistrationApp/
├── App.js                          # Main application entry
├── package.json                    # Dependencies
├── app.json                        # Expo configuration
├── babel.config.js                 # Babel configuration
│
├── src/
│   ├── screens/                    # All screen components
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── AcademicCoursesScreen.js
│   │   ├── UniversalCoursesScreen.js
│   │   └── ProfileScreen.js
│   │
│   ├── navigation/                 # Navigation configuration
│   │   └── MainNavigator.js
│   │
│   ├── context/                    # Context API for state management
│   │   └── AuthContext.js
│   │
│   ├── data/                       # Mock data
│   │   └── mockData.js
│   │
│   └── utils/                      # Utility functions
│
└── database/                       # Database schemas
    ├── schema_mysql.sql            # MySQL/PostgreSQL schema
    └── schema_mongodb.js           # MongoDB schema
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd CourseRegistrationApp

# Install dependencies
npm install

# OR using yarn
yarn install
```

### Step 2: Install Expo CLI (if not installed)

```bash
npm install -g expo-cli
```

### Step 3: Install Expo Go App
- Download **Expo Go** app on your Android/iOS device from Play Store/App Store

---

## 💾 Database Setup

### Option 1: MySQL/PostgreSQL

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE course_registration;

# Use the database
USE course_registration;

# Import schema
source database/schema_mysql.sql;
```

### Option 2: MongoDB

```bash
# Start MongoDB
mongod

# Open MongoDB shell
mongo

# Create database and import schema
use course_registration
# Then copy and paste the content from database/schema_mongodb.js
```

### Option 3: Firebase/Firestore

1. Create a Firebase project at https://firebase.google.com
2. Enable Authentication (Email/Password and Google)
3. Enable Firestore Database
4. Use the MongoDB schema as reference for Firestore collections

---

## 📱 Running the Application

### Development Mode

```bash
# Start the development server
npm start

# OR
expo start
```

### Run on Specific Platform

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

### Using Expo Go App

1. Start the development server: `npm start`
2. Scan the QR code with Expo Go app (Android) or Camera app (iOS)
3. The app will load on your device

---

## 📸 App Screenshots

### Authentication Screens
- **Login**: Email/password login with Google Sign-In option
- **Register**: Complete registration with phone and email verification

### Main Screens
- **Home**: Dashboard with statistics and quick actions
- **Dashboard**: Progress tracking for enrolled courses
- **Academic Courses**: Semester-wise course listing
- **Universal Courses**: Browse and filter market courses
- **Profile**: Manage personal information and settings

---

## 🗄️ Database Schema

### Main Tables/Collections

1. **Users**
   - Personal information
   - Authentication credentials
   - Social links
   - Account status

2. **Admins**
   - Admin credentials
   - Roles and permissions
   - Activity logs

3. **AcademicCourses**
   - Course details
   - Semester and year
   - Faculty information
   - College domain filtering

4. **UniversalCourses**
   - Provider information
   - Ratings and reviews
   - Pricing and duration
   - Skill level

5. **Enrollments**
   - User-course relationships
   - Progress tracking
   - Completion status

6. **Certificates**
   - Certificate details
   - Verification codes
   - Approval status

7. **Notifications**
   - User notifications
   - Read status
   - Notification types

---

## 🔌 API Endpoints (For Backend Implementation)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google Sign-In
- `POST /api/auth/forgot-password` - Send reset link
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/verify-phone` - Verify phone

### Courses
- `GET /api/courses/academic` - Get academic courses
- `GET /api/courses/universal` - Get universal courses
- `POST /api/courses/enroll` - Enroll in course
- `PUT /api/courses/progress` - Update progress

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/enrollments` - Get enrolled courses
- `GET /api/user/certificates` - Get certificates

### Admin
- `POST /api/admin/courses` - Add course
- `PUT /api/admin/courses/:id` - Edit course
- `DELETE /api/admin/courses/:id` - Delete course
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/block` - Block user

---

## 🎯 Future Enhancements

1. **Integrated IDE/Compiler**
   - Online code editor
   - Support for C, C++, Java, Python
   - Run and test code

2. **Gamification**
   - Points system
   - Badges and achievements
   - Leaderboard
   - Completion streaks

3. **Analytics Dashboard**
   - Graphical progress tracking
   - Course completion trends
   - Skill distribution charts

4. **Advanced Features**
   - AI course recommendations
   - Resume builder
   - Internship portal integration
   - Chatbot support
   - Blockchain certificate verification
   - Placement tracking

5. **Notifications**
   - Email notifications
   - Push notifications
   - Course reminders
   - Certificate approvals

6. **Social Features**
   - Discussion forums
   - Study groups
   - Peer reviews

---

## 📝 Notes

### For College Mini Project:
- This is a **frontend-only** implementation with mock data
- Database schemas are provided for future backend integration
- All data is currently stored in-memory using React Context
- No actual API calls are made (uses mock data)

### To Make it Production-Ready:
1. Implement backend API (Node.js/Firebase)
2. Connect database (MySQL/MongoDB/Firestore)
3. Add proper authentication (JWT/Firebase Auth)
4. Implement file upload for certificates
5. Add email/SMS services for OTP
6. Deploy backend and database
7. Configure environment variables
8. Add proper error handling
9. Implement security measures

---

## 👨‍💻 Developer

**Prepared By:** JANARTHANAN Mathesh  
**Project Type:** Final Year / Academic Project  
**Version:** 1.0

---

## 📄 License

This project is created for educational purposes as part of a college mini project.

---

## 🤝 Contributing

This is an academic project. For any queries or suggestions, please contact the developer.

---

## ⚠️ Important Notes

1. **Mock Data**: The app currently uses mock/dummy data. Connect to a real backend for production use.

2. **Authentication**: Google Sign-In requires additional setup with Firebase/Google OAuth.

3. **OTP Verification**: Email and phone OTP verification needs integration with services like Twilio (SMS) and SendGrid (Email).

4. **File Upload**: Certificate upload functionality requires cloud storage (Firebase Storage, AWS S3, etc.).

5. **College Domain Filtering**: Academic courses are filtered based on email domain. Ensure proper validation in backend.

---

## 📞 Support

For any issues or questions, please refer to:
- React Native Documentation: https://reactnative.dev/
- Expo Documentation: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/

---

**Happy Coding! 🚀**
