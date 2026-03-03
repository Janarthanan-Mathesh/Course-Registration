# Course Registration App – Backend API

Node.js + Express + MongoDB REST API based on the SRS document.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET, email credentials
```

### 3. Run Server
```bash
npm run dev   # Development (nodemon)
npm start     # Production
```

---

## 📁 Project Structure

```
backend/
├── server.js               # Entry point
├── src/
│   ├── config/db.js        # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js         # JWT protect middleware
│   │   └── admin.js        # Admin-only middleware
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── AcademicCourse.js
│   │   ├── UniversalCourse.js
│   │   ├── Enrollment.js
│   │   ├── Certificate.js
│   │   └── Notification.js
│   ├── controllers/        # Business logic
│   ├── routes/             # API endpoints
│   └── utils/
│       ├── email.js        # Nodemailer helpers
│       └── otp.js          # OTP generation
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-email` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | Login (email/username + password) |
| POST | `/api/auth/forgot-password` | Forgot password |
| POST | `/api/auth/reset-password/:token` | Reset password |
| POST | `/api/auth/google` | Google Sign-In |

### Users (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get own profile |
| PUT | `/api/users/me` | Update profile |
| PUT | `/api/users/change-password` | Change password |
| GET | `/api/users/dashboard` | Dashboard stats |
| GET | `/api/users/activity` | Activity logs |

### Academic Courses (🔒 College email required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/academic-courses` | Get courses (filtered by sem/year) |
| GET | `/api/academic-courses/:id` | Get single course |
| POST | `/api/academic-courses` | Create (admin only) |
| PUT | `/api/academic-courses/:id` | Update (admin only) |
| DELETE | `/api/academic-courses/:id` | Delete (admin only) |

### Universal Courses (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/universal-courses` | Get courses (filter: provider, skillLevel, search) |
| GET | `/api/universal-courses/:id` | Get single course with reviews |
| POST | `/api/universal-courses/:id/reviews` | Add review |
| POST | `/api/universal-courses` | Create (admin only) |
| PUT | `/api/universal-courses/:id` | Update (admin only) |
| DELETE | `/api/universal-courses/:id` | Delete (admin only) |

### Enrollments (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/enrollments` | Enroll in a course |
| GET | `/api/enrollments` | Get my enrollments |
| PUT | `/api/enrollments/:id/progress` | Update progress (0–100) |
| PUT | `/api/enrollments/:id/wishlist` | Toggle wishlist |
| DELETE | `/api/enrollments/:id` | Unenroll |

### Certificates (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/certificates` | Upload certificate (multipart/form-data) |
| GET | `/api/certificates` | Get my certificates |
| GET | `/api/certificates/all` | Get all (admin only) |
| PUT | `/api/certificates/:id/approve` | Approve (admin only) |

### Admin (🔒 Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/users/:id` | User detail |
| PUT | `/api/admin/users/:id/block` | Block/Unblock user |
| POST | `/api/admin/notify` | Broadcast notification |

### Notifications (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/read-all` | Mark all read |
| PUT | `/api/notifications/:id/read` | Mark one read |

---

## 🔒 Auth Header
All protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

## 🎮 Gamification Points
| Action | Points |
|--------|--------|
| Enroll in a course | +10 |
| Complete a course | +50 |

## 📧 Email Features
- OTP for email verification on registration
- Password reset email with token link
- Course completion congratulation email
- Certificate approval notification

## 🔑 College Domain Access
Academic courses are restricted to users whose email domain matches `COLLEGE_DOMAIN` in `.env`.
Example: `janarthanan.ad23@bitsathy.ac.in` → domain: `bitsathy.ac.in`
