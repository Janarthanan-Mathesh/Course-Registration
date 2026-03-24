# Course Registration App - Backend API

Node.js + Express + MongoDB REST API.

## Implemented
- JWT authentication and protected routes
- Role model: `student`, `mentor`, `admin`
- Admin-only middleware for restricted routes
- Email OTP verification and password reset flows
- Admin verification support (Firebase token + developer fallback OTP)
- Certificate upload support (PDF/image via multipart `multer`)

## Quick Start
```bash
cd backend
npm install
npm start
```

## Environment Setup
Create `.env` from `.env.example` and configure:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `COLLEGE_DOMAIN`
- `DEVELOPER_VERIFY_PHONE`
- `ADMIN_DEV_OTP`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## API Groups
- `/api/auth`
- `/api/users`
- `/api/academic-courses`
- `/api/universal-courses`
- `/api/enrollments`
- `/api/certificates`
- `/api/admin`
- `/api/notifications`

## Auth Header
Use JWT for protected routes:
```http
Authorization: Bearer <token>
```

## Notes
- Legacy users with role `user` are migrated to `student` on login.
- Certificate upload endpoint: `POST /api/certificates` with field name `certificate`.
