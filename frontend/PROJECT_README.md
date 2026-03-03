# 📚 Course Registration App - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Entity-Relationship Diagram](#entity-relationship-diagram)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Installation & Setup](#installation--setup)
7. [Features](#features)
8. [Technology Stack](#technology-stack)
9. [Screenshots](#screenshots)

---

## 📖 Project Overview

### Description
The Course Registration App is a comprehensive full-stack mobile application that enables students to browse, register for, and track academic and universal courses. The system provides secure authentication, course management, enrollment tracking, and profile management.

### Key Features
- ✅ User authentication with JWT tokens
- ✅ Academic courses filtered by college email domain
- ✅ Universal courses from multiple providers (Udemy, Coursera, AWS, Oracle, etc.)
- ✅ Course enrollment and progress tracking
- ✅ User profile management
- ✅ Google OAuth integration (optional)
- ✅ Persistent data storage with MongoDB

### Project Type
Final Year / Academic Project

### Developed By
JANARTHANAN Mathesh

---

## 🏗️ System Architecture

```
┌─────────────────┐
│   Mobile App    │
│  (React Native) │
│    + Expo       │
└────────┬────────┘
         │
         │ HTTP/REST API
         │
┌────────▼────────┐
│   Backend API   │
│   (Node.js +    │
│    Express)     │
└────────┬────────┘
         │
         │ Mongoose ODM
         │
┌────────▼────────┐
│    MongoDB      │
│   Database      │
└─────────────────┘
```

### Architecture Layers

1. **Presentation Layer (Frontend)**
   - React Native with Expo
   - React Navigation for routing
   - Context API for state management
   - AsyncStorage for local data

2. **Application Layer (Backend)**
   - Express.js REST API
   - JWT authentication middleware
   - Business logic controllers
   - Input validation

3. **Data Layer (Database)**
   - MongoDB NoSQL database
   - Mongoose ODM for schema modeling
   - Indexed collections for performance

---

## 🗺️ Entity-Relationship Diagram

### ER Diagram (Textual Representation)

```
┌──────────────┐         ┌────────────────────┐         ┌──────────────────┐
│    USERS     │         │    ENROLLMENTS     │         │ ACADEMIC_COURSES │
├──────────────┤         ├────────────────────┤         ├──────────────────┤
│ _id (PK)     │◄───────┤ userId (FK)        │         │ _id (PK)         │
│ username     │         │ courseId (FK)      ├────────►│ courseCode       │
│ email        │         │ courseType         │         │ courseName       │
│ password     │         │ progressPercentage │         │ description      │
│ phoneNumber  │         │ completionStatus   │         │ credits          │
│ linkedinUrl  │         │ lastAccessed       │         │ facultyName      │
│ githubUrl    │         │ enrollmentDate     │         │ semester         │
│ emailVerified│         │ completionDate     │         │ year             │
│ phoneVerified│         └────────────────────┘         │ department       │
│ accountStatus│                   │                     │ collegeDomain    │
│ lastLogin    │                   │                     │ isActive         │
│ createdAt    │                   │                     └──────────────────┘
│ updatedAt    │                   │
└──────────────┘                   │
                                   │
                                   │
                          ┌────────▼──────────────┐
                          │  UNIVERSAL_COURSES    │
                          ├───────────────────────┤
                          │ _id (PK)              │
                          │ courseName            │
                          │ provider              │
                          │ description           │
                          │ duration              │
                          │ skillLevel            │
                          │ price                 │
                          │ rating                │
                          │ totalReviews          │
                          │ category              │
                          │ tags                  │
                          │ isActive              │
                          └───────────────────────┘
```

### Relationships

1. **Users → Enrollments** (One-to-Many)
   - One user can have multiple enrollments
   - Each enrollment belongs to one user

2. **Enrollments → Courses** (Many-to-One)
   - Each enrollment references either an Academic Course OR a Universal Course
   - One course can have multiple enrollments

### Cardinality

- **User : Enrollment** → `1:N` (One user, many enrollments)
- **Course : Enrollment** → `1:N` (One course, many enrollments)
- **Enrollment** acts as a junction/bridge between Users and Courses

---

## 📊 Database Schema

### Database Type: MongoDB (NoSQL)

---

### 1. USERS Collection

**Purpose:** Stores user account information and authentication details

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| _id | ObjectId | Yes | Yes | Auto | Primary key |
| username | String | Yes | Yes | - | Unique username (min 3 chars) |
| email | String | Yes | Yes | - | Email address (validated format) |
| password | String | Conditional | No | - | Hashed password (bcrypt) |
| googleId | String | No | Yes | - | Google OAuth ID (if using Google Sign-In) |
| phoneNumber | String | Yes | No | - | Phone number |
| phoneVerified | Boolean | No | No | false | Phone verification status |
| emailVerified | Boolean | No | No | false | Email verification status |
| linkedinUrl | String | No | No | '' | LinkedIn profile URL |
| githubUrl | String | No | No | '' | GitHub profile URL |
| profileImageUrl | String | No | No | '' | Profile picture URL |
| accountStatus | String (Enum) | No | No | 'active' | Account status: active/blocked/suspended |
| lastLogin | Date | No | No | - | Last login timestamp |
| createdAt | Date | Yes | No | Now | Account creation date |
| updatedAt | Date | Yes | No | Now | Last update date |

**Indexes:**
- `email` (unique)
- `username` (unique)
- `googleId` (unique, sparse)

**Validation Rules:**
- Email: Must match regex pattern for valid email
- Password: Minimum 6 characters (hashed with bcrypt)
- Username: Minimum 3 characters, unique

**Sample Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "janarthanan",
  "email": "janarthanan.ad23@bitsathy.ac.in",
  "password": "$2b$10$encrypted_hash_here",
  "phoneNumber": "+919876543210",
  "phoneVerified": true,
  "emailVerified": true,
  "linkedinUrl": "https://linkedin.com/in/janarthanan",
  "githubUrl": "https://github.com/janarthanan",
  "profileImageUrl": "",
  "accountStatus": "active",
  "lastLogin": "2026-02-12T10:30:00.000Z",
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2026-02-12T10:30:00.000Z"
}
```

---

### 2. ACADEMIC_COURSES Collection

**Purpose:** Stores college/university academic courses

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| _id | ObjectId | Yes | Yes | Auto | Primary key |
| courseCode | String | Yes | Yes | - | Course code (e.g., CS301), uppercase |
| courseName | String | Yes | No | - | Full course name |
| description | String | Yes | No | - | Course description |
| credits | Number | Yes | No | - | Credit hours (1-6) |
| facultyName | String | Yes | No | - | Professor/Faculty name |
| semester | Number | Yes | No | - | Semester number (1-8) |
| year | Number | Yes | No | - | Year of study (1-4) |
| department | String | No | No | 'Computer Science' | Department name |
| collegeDomain | String | Yes | No | - | College email domain for filtering |
| syllabusUrl | String | No | No | - | URL to syllabus document |
| prerequisites | Array[String] | No | No | [] | List of prerequisite course codes |
| isActive | Boolean | No | No | true | Course active status |
| createdAt | Date | Yes | No | Now | Creation date |
| updatedAt | Date | Yes | No | Now | Last update date |

**Indexes:**
- `courseCode` (unique)
- `semester`
- `collegeDomain`

**Sample Document:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "courseCode": "CS301",
  "courseName": "Data Structures and Algorithms",
  "description": "Advanced data structures including trees, graphs, and algorithm analysis",
  "credits": 4,
  "facultyName": "Dr. Rajesh Kumar",
  "semester": 3,
  "year": 2,
  "department": "Computer Science",
  "collegeDomain": "bitsathy.ac.in",
  "syllabusUrl": "https://example.com/syllabus/cs301.pdf",
  "prerequisites": ["CS201", "CS202"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 3. UNIVERSAL_COURSES Collection

**Purpose:** Stores online courses from platforms like Udemy, Coursera, AWS, Oracle

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| _id | ObjectId | Yes | Yes | Auto | Primary key |
| courseName | String | Yes | No | - | Course title |
| provider | String (Enum) | Yes | No | - | Udemy/Coursera/AWS/Oracle/Pega/edX/LinkedIn Learning/Other |
| description | String | Yes | No | - | Course description |
| duration | String | Yes | No | - | Course duration (e.g., "40 hours") |
| skillLevel | String (Enum) | Yes | No | - | Beginner/Intermediate/Advanced |
| price | String | No | No | 'Free' | Course price |
| rating | Number | No | No | 0 | Course rating (0-5) |
| totalReviews | Number | No | No | 0 | Number of reviews |
| courseUrl | String | No | No | - | URL to course page |
| thumbnailUrl | String | No | No | - | Course thumbnail image URL |
| category | String | No | No | 'General' | Course category |
| tags | Array[String] | No | No | [] | Array of tags |
| language | String | No | No | 'English' | Course language |
| isActive | Boolean | No | No | true | Course active status |
| createdAt | Date | Yes | No | Now | Creation date |
| updatedAt | Date | Yes | No | Now | Last update date |

**Indexes:**
- `provider`
- `skillLevel`
- `category`

**Sample Document:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "courseName": "Complete Python Bootcamp",
  "provider": "Udemy",
  "description": "Learn Python like a Professional! Start from basics to creating your own applications",
  "duration": "40 hours",
  "skillLevel": "Beginner",
  "price": "Free",
  "rating": 4.6,
  "totalReviews": 125000,
  "courseUrl": "https://www.udemy.com/course/python-bootcamp",
  "thumbnailUrl": "https://example.com/thumbnails/python.jpg",
  "category": "Programming",
  "tags": ["Python", "Programming", "Beginner"],
  "language": "English",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 4. ENROLLMENTS Collection

**Purpose:** Tracks course enrollments and student progress

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| _id | ObjectId | Yes | Yes | Auto | Primary key |
| userId | ObjectId (FK) | Yes | No | - | Reference to Users collection |
| courseId | ObjectId (FK) | Yes | No | - | Reference to course (Academic or Universal) |
| courseType | String (Enum) | Yes | No | - | 'academic' or 'universal' |
| completionStatus | String (Enum) | No | No | 'enrolled' | enrolled/in_progress/completed/dropped |
| progressPercentage | Number | No | No | 0 | Progress percentage (0-100) |
| lastAccessed | Date | No | No | Now | Last access timestamp |
| completionDate | Date | No | No | - | Course completion date |
| grade | String | No | No | - | Final grade (if applicable) |
| certificateIssued | Boolean | No | No | false | Certificate issued status |
| createdAt | Date | Yes | No | Now | Enrollment date |
| updatedAt | Date | Yes | No | Now | Last update date |

**Indexes:**
- `userId`
- `courseId`
- Compound unique index on `(userId, courseId, courseType)` to prevent duplicate enrollments

**Sample Document:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "userId": "507f1f77bcf86cd799439011",
  "courseId": "507f1f77bcf86cd799439012",
  "courseType": "academic",
  "completionStatus": "in_progress",
  "progressPercentage": 65,
  "lastAccessed": "2026-02-12T14:30:00.000Z",
  "completionDate": null,
  "grade": null,
  "certificateIssued": false,
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2026-02-12T14:30:00.000Z"
}
```

---

## 🔄 Database Relationships Explained

### 1. User-Enrollment Relationship (One-to-Many)

```
One User → Multiple Enrollments

User {_id: "U001"}
  ↓
Enrollment {userId: "U001", courseId: "C001", courseType: "academic"}
Enrollment {userId: "U001", courseId: "C002", courseType: "universal"}
Enrollment {userId: "U001", courseId: "C003", courseType: "academic"}
```

### 2. Course-Enrollment Relationship (One-to-Many)

```
One Course → Multiple Enrollments (by different users)

AcademicCourse {_id: "C001"}
  ↓
Enrollment {userId: "U001", courseId: "C001"}
Enrollment {userId: "U002", courseId: "C001"}
Enrollment {userId: "U003", courseId: "C001"}
```

### 3. Enrollment as Junction Entity

Enrollments act as a bridge between Users and Courses:
- Links users to their enrolled courses
- Tracks individual progress per user per course
- Prevents duplicate enrollments with compound unique index

---

## 📐 ER Diagram (Visual)

### Detailed ER Diagram with Attributes

```
┌─────────────────────────────────┐
│          USERS                  │
├─────────────────────────────────┤
│ PK: _id                         │
│    username (unique)            │
│    email (unique)               │
│    password (hashed)            │
│    googleId (unique, optional)  │
│    phoneNumber                  │
│    phoneVerified                │
│    emailVerified                │
│    linkedinUrl                  │
│    githubUrl                    │
│    profileImageUrl              │
│    accountStatus                │
│    lastLogin                    │
│    createdAt                    │
│    updatedAt                    │
└─────────────┬───────────────────┘
              │
              │ 1
              │
              │ enrolls in
              │
              │ N
              ▼
┌─────────────────────────────────┐
│       ENROLLMENTS               │
├─────────────────────────────────┤
│ PK: _id                         │
│ FK: userId ──────────────┐      │
│ FK: courseId             │      │
│    courseType            │      │
│    completionStatus      │      │
│    progressPercentage    │      │
│    lastAccessed          │      │
│    completionDate        │      │
│    grade                 │      │
│    certificateIssued     │      │
│    createdAt             │      │
│    updatedAt             │      │
└──────────┬──────────┬────┴──────┘
           │          │
           │ N        │ N
           │          │
       references references
           │          │
           │ 1        │ 1
           ▼          ▼
┌──────────────────┐  ┌─────────────────────┐
│ ACADEMIC_COURSES │  │ UNIVERSAL_COURSES   │
├──────────────────┤  ├─────────────────────┤
│ PK: _id          │  │ PK: _id             │
│    courseCode    │  │    courseName       │
│    courseName    │  │    provider         │
│    description   │  │    description      │
│    credits       │  │    duration         │
│    facultyName   │  │    skillLevel       │
│    semester      │  │    price            │
│    year          │  │    rating           │
│    department    │  │    totalReviews     │
│    collegeDomain │  │    courseUrl        │
│    syllabusUrl   │  │    thumbnailUrl     │
│    prerequisites │  │    category         │
│    isActive      │  │    tags             │
│    createdAt     │  │    language         │
│    updatedAt     │  │    isActive         │
└──────────────────┘  │    createdAt        │
                      │    updatedAt        │
                      └─────────────────────┘
```

### Relationship Legend

- **PK**: Primary Key
- **FK**: Foreign Key
- **1**: One
- **N**: Many
- **→**: One-to-Many relationship
- **──**: Foreign Key reference

---

## 🗂️ Database Constraints & Rules

### 1. Unique Constraints

| Collection | Field(s) | Purpose |
|------------|----------|---------|
| Users | email | Prevent duplicate email addresses |
| Users | username | Ensure unique usernames |
| Users | googleId | Prevent duplicate Google OAuth IDs |
| AcademicCourses | courseCode | Unique course identifiers |
| Enrollments | (userId, courseId, courseType) | Prevent duplicate enrollments |

### 2. Required Fields

**Users:**
- username, email, phoneNumber
- password (unless googleId is provided)

**AcademicCourses:**
- courseCode, courseName, description, credits, facultyName, semester, year, collegeDomain

**UniversalCourses:**
- courseName, provider, description, duration, skillLevel

**Enrollments:**
- userId, courseId, courseType

### 3. Enum Constraints

| Field | Allowed Values |
|-------|---------------|
| Users.accountStatus | 'active', 'blocked', 'suspended' |
| UniversalCourses.provider | 'Udemy', 'Coursera', 'AWS', 'Oracle', 'Pega', 'edX', 'LinkedIn Learning', 'Other' |
| UniversalCourses.skillLevel | 'Beginner', 'Intermediate', 'Advanced' |
| Enrollments.completionStatus | 'enrolled', 'in_progress', 'completed', 'dropped' |
| Enrollments.courseType | 'academic', 'universal' |

### 4. Range Constraints

| Field | Range/Constraint |
|-------|------------------|
| AcademicCourses.credits | 1 to 6 |
| AcademicCourses.semester | 1 to 8 |
| AcademicCourses.year | 1 to 4 |
| UniversalCourses.rating | 0 to 5 |
| Enrollments.progressPercentage | 0 to 100 |

### 5. Validation Rules

- **Email**: Must match regex pattern `/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/`
- **Password**: Minimum 6 characters, hashed with bcrypt (salt rounds: 10)
- **Username**: Minimum 3 characters
- **Phone Number**: Required but flexible format
- **Course Code**: Uppercase letters and numbers

---

## 🔍 Sample Database Queries

### MongoDB Query Examples

#### 1. Get all courses enrolled by a user
```javascript
db.enrollments.aggregate([
  { $match: { userId: ObjectId("507f1f77bcf86cd799439011") } },
  {
    $lookup: {
      from: "academic_courses",
      localField: "courseId",
      foreignField: "_id",
      as: "academicCourse"
    }
  },
  {
    $lookup: {
      from: "universal_courses",
      localField: "courseId",
      foreignField: "_id",
      as: "universalCourse"
    }
  }
])
```

#### 2. Get user progress statistics
```javascript
db.enrollments.aggregate([
  { $match: { userId: ObjectId("507f1f77bcf86cd799439011") } },
  {
    $group: {
      _id: "$userId",
      totalEnrollments: { $sum: 1 },
      completedCourses: {
        $sum: {
          $cond: [{ $eq: ["$completionStatus", "completed"] }, 1, 0]
        }
      },
      averageProgress: { $avg: "$progressPercentage" }
    }
  }
])
```

#### 3. Get academic courses by semester
```javascript
db.academic_courses.find({
  semester: 3,
  collegeDomain: "bitsathy.ac.in",
  isActive: true
}).sort({ courseCode: 1 })
```

#### 4. Search universal courses
```javascript
db.universal_courses.find({
  $or: [
    { courseName: { $regex: "Python", $options: "i" } },
    { description: { $regex: "Python", $options: "i" } }
  ],
  provider: "Udemy",
  skillLevel: "Beginner",
  isActive: true
})
```

#### 5. Get popular courses
```javascript
db.universal_courses.find({ isActive: true })
  .sort({ rating: -1, totalReviews: -1 })
  .limit(10)
```

#### 6. Check if user already enrolled
```javascript
db.enrollments.findOne({
  userId: ObjectId("507f1f77bcf86cd799439011"),
  courseId: ObjectId("507f1f77bcf86cd799439012"),
  courseType: "academic"
})
```

#### 7. Update enrollment progress
```javascript
db.enrollments.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439014") },
  {
    $set: {
      progressPercentage: 75,
      completionStatus: "in_progress",
      lastAccessed: new Date()
    }
  }
)
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register

Request Body:
{
  "username": "janarthanan",
  "email": "janarthanan.ad23@bitsathy.ac.in",
  "password": "password123",
  "phoneNumber": "+919876543210",
  "linkedinUrl": "https://linkedin.com/in/janarthanan",
  "githubUrl": "https://github.com/janarthanan"
}

Response (201):
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login User
```http
POST /auth/login

Request Body:
{
  "email": "janarthanan.ad23@bitsathy.ac.in",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Google Sign-In
```http
POST /auth/google

Request Body:
{
  "idToken": "google_oauth_id_token"
}

Response (200):
{
  "success": true,
  "message": "Google sign-in successful",
  "data": {
    "user": { ... },
    "token": "...",
    "isNewUser": false
  }
}
```

#### 4. Get Current User
```http
GET /auth/me
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

#### 5. Update Profile
```http
PUT /auth/profile
Headers: Authorization: Bearer {token}

Request Body:
{
  "username": "new_username",
  "phoneNumber": "+919876543210",
  "linkedinUrl": "https://linkedin.com/in/updated",
  "githubUrl": "https://github.com/updated"
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { ... }
  }
}
```

### Course Endpoints

#### 6. Get Academic Courses
```http
GET /courses/academic?semester=3&domain=bitsathy.ac.in
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "count": 5,
  "data": {
    "courses": [ ... ]
  }
}
```

#### 7. Get Universal Courses
```http
GET /courses/universal?provider=Udemy&skillLevel=Beginner&search=Python
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "count": 8,
  "data": {
    "courses": [ ... ]
  }
}
```

#### 8. Enroll in Course
```http
POST /courses/enroll
Headers: Authorization: Bearer {token}

Request Body:
{
  "courseId": "507f1f77bcf86cd799439012",
  "courseType": "academic"
}

Response (201):
{
  "success": true,
  "message": "Successfully enrolled in course",
  "data": {
    "enrollment": { ... }
  }
}
```

#### 9. Get User Enrollments
```http
GET /courses/enrollments
Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "count": 3,
  "data": {
    "enrollments": [
      {
        "_id": "...",
        "userId": "...",
        "courseId": "...",
        "courseType": "academic",
        "progressPercentage": 65,
        "courseDetails": { ... }
      }
    ]
  }
}
```

#### 10. Update Enrollment Progress
```http
PUT /courses/enrollments/{enrollmentId}
Headers: Authorization: Bearer {token}

Request Body:
{
  "progressPercentage": 75,
  "completionStatus": "in_progress"
}

Response (200):
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "enrollment": { ... }
  }
}
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Expo CLI
- Expo Go app (on mobile device)

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Edit .env file with your MongoDB URI and JWT secret

# 4. Seed database with sample courses
node seed.js

# 5. Start backend server
npm run dev
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure API URL
# Edit src/config/api.js with your computer's IP address

# 4. Start Expo development server
npm start

# 5. Scan QR code with Expo Go app
```

### Environment Variables

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/course_registration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:8081
```

**Frontend (src/config/api.js):**
```javascript
export const API_URL = 'http://192.168.1.100:5000/api';
export const GOOGLE_CLIENT_ID = 'your_google_client_id.apps.googleusercontent.com';
```

---

## ✨ Features

### Authentication
- ✅ Email/Password registration and login
- ✅ JWT token-based authentication
- ✅ Google OAuth sign-in integration
- ✅ Password hashing with bcrypt
- ✅ Persistent sessions with AsyncStorage
- ✅ Account verification (email & phone)

### Course Management
- ✅ Browse academic courses filtered by college domain
- ✅ Browse universal courses from multiple providers
- ✅ Search and filter courses
- ✅ View course details (credits, faculty, duration, ratings)
- ✅ Course categories and skill levels

### Enrollment System
- ✅ Enroll in academic and universal courses
- ✅ Track enrollment progress
- ✅ View enrollment history
- ✅ Update completion status
- ✅ Certificate management

### User Profile
- ✅ View and edit personal information
- ✅ Update social media links (LinkedIn, GitHub)
- ✅ Profile verification badges
- ✅ Account activity logs
- ✅ Secure logout

### Dashboard
- ✅ View enrolled courses
- ✅ Track progress with progress bars
- ✅ Statistics (total enrollments, completed courses)
- ✅ Recent activity

---

## 💻 Technology Stack

### Frontend
- **Framework:** React Native
- **Build Tool:** Expo
- **Navigation:** React Navigation
- **State Management:** Context API
- **HTTP Client:** Axios
- **Storage:** AsyncStorage
- **Icons:** Expo Vector Icons
- **UI Components:** Custom components

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **OAuth:** Google Auth Library
- **Validation:** Express Validator
- **Middleware:** CORS, Body Parser

### Database
- **Type:** NoSQL (MongoDB)
- **Hosting Options:** 
  - Local MongoDB
  - MongoDB Atlas (Cloud)

---

## 📱 Screenshots

### Mobile App Screens

1. **Login Screen**
   - Email/password input
   - Google Sign-In button
   - Password visibility toggle
   - Navigation to registration

2. **Registration Screen**
   - Username, email, phone, password fields
   - Optional LinkedIn and GitHub links
   - Form validation
   - Auto-login after registration

3. **Home Dashboard**
   - Welcome message
   - Statistics cards (Enrolled, Completed, Certificates)
   - Quick action buttons
   - Recent courses list

4. **Profile Screen**
   - User avatar with initial
   - Personal information display
   - Edit mode toggle
   - Social media links
   - Verified badges
   - Logout button

5. **Courses Screen**
   - Academic courses (semester-wise)
   - Universal courses (provider-wise)
   - Search and filter options
   - Course cards with details

6. **Dashboard Screen**
   - Enrolled courses list
   - Progress tracking
   - Completion status
   - Statistics overview

---

## 🗄️ Database Backup & Restore

### Backup MongoDB Database

```bash
# Full database backup
mongodump --db course_registration --out /backup/

# Backup specific collection
mongodump --db course_registration --collection users --out /backup/

# Backup with compression
mongodump --db course_registration --archive=backup.archive --gzip
```

### Restore MongoDB Database

```bash
# Restore full database
mongorestore --db course_registration /backup/course_registration/

# Restore specific collection
mongorestore --db course_registration --collection users /backup/course_registration/users.bson

# Restore from compressed archive
mongorestore --db course_registration --archive=backup.archive --gzip
```

---

## 🔒 Security Features

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Minimum password length enforcement
   - Password never stored in plain text

2. **JWT Authentication**
   - Secure token generation
   - Token expiration (30 days default)
   - Token verification on protected routes

3. **Input Validation**
   - Email format validation
   - Phone number validation
   - SQL injection prevention (MongoDB)
   - XSS protection

4. **Authorization**
   - Role-based access control
   - Protected API endpoints
   - User-specific data access

5. **Data Privacy**
   - Password excluded from API responses
   - Secure user data storage
   - CORS configuration

---

## 📈 Future Enhancements

1. **Advanced Features**
   - AI-powered course recommendations
   - Certificate blockchain verification
   - Video course content streaming
   - Discussion forums
   - Live chat support

2. **Gamification**
   - Points and badges system
   - Leaderboards
   - Achievement unlocks
   - Completion streaks

3. **Analytics**
   - Course completion analytics
   - User progress reports
   - Popular courses dashboard
   - Enrollment trends

4. **Integration**
   - Payment gateway integration
   - Email/SMS notifications
   - Calendar integration
   - Resume builder
   - Internship portal

5. **Admin Features**
   - Admin dashboard
   - Course management UI
   - User management
   - Analytics dashboard
   - Content moderation

---

## 👨‍💻 Developer Information

**Project Name:** Course Registration App  
**Developed By:** JANARTHANAN Mathesh  
**Project Type:** Final Year / Academic Project  
**Technology:** Full Stack (MERN)  
**Platform:** Cross-platform Mobile Application  
**Version:** 1.0.0  
**License:** MIT (for educational purposes)

---

## 📞 Support & Contact

For issues, questions, or contributions:

- Check the documentation
- Review error logs
- Verify all setup steps
- Check MongoDB connection
- Ensure correct API configuration

---

## 📄 License

This project is developed for educational purposes as part of an academic project.

---

**Last Updated:** February 2026  
**Documentation Version:** 1.0

---

