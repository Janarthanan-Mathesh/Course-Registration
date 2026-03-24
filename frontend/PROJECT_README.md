# Course Registration App - Project Documentation

This document reflects the **current implemented state** for evaluation.

## Architecture
- `frontend/`: React Native Expo app
- `backend/`: Node.js + Express REST API
- `MongoDB`: data persistence via Mongoose

## Implemented Evaluation-Critical Features
- Organized frontend/backend folder structures
- JWT authentication and protected route middleware
- Role model: `student`, `mentor`, `admin`
- Role-based navigation in app
- Splash route with persisted session restore (AsyncStorage)
- Real certificate file upload (PDF/image) with multipart FormData
- Admin certificate review and approval/rejection
- FlatList optimization on major list-heavy screens

## Backend Run
```bash
cd backend
npm install
npm start
```

## Frontend Run
```bash
cd frontend
npm install
npm start
```

## Backend Environment (`backend/.env`)
Required keys:
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

## Frontend Environment (`frontend/.env`)
Required keys:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_DEVELOPER_VERIFY_PHONE`
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_API_BASE_URLS` (optional)

## Admin Verification Flow
For `admin` login:
1. Verify via Firebase phone OTP, or
2. Use backend fallback developer code (`ADMIN_DEV_OTP`)

## Build Artifact (Android)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

Keep APK/AAB URL or downloaded artifact as evaluation proof.

## Evaluator Demo Checklist
1. Register a new user and verify email OTP.
2. Login and validate protected API access with JWT.
3. Confirm admin-only endpoints reject non-admin users.
4. Confirm navigation changes for student/mentor/admin.
5. Upload certificate (PDF/image) from frontend and review in admin screen.
6. Logout and confirm session clear.
7. Restart app and confirm session restore when token is valid.

## Known Limitations
- EAS build requires network and Expo account authentication.
- Firebase OTP delivery can be intermittent by region/provider; fallback code path exists for admin continuity.
