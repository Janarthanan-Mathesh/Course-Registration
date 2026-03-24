# Course Registration App (Frontend)

React Native (Expo) mobile client for Course Registration with integrated Node/Express backend APIs.

## Tech Stack
- Expo + React Native
- React Navigation
- AsyncStorage session persistence
- Firebase client SDK (admin verification flow support)

## Current Scope
- Splash boot route with session restore
- Login/Register with role-based auth (`student`, `mentor`, `admin`)
- Admin verification:
  - Firebase phone OTP, or
  - Developer fallback code supported by backend
- Dashboard with certificate submission and verification status
- Academic and Universal course browsing/registration
- Profile view/edit and logout
- FlatList optimization in heavy list screens

## Project Structure
```text
frontend/
  App.js
  app.json
  package.json
  src/
    components/
      AppButton.js
      AppInput.js
      AppLoader.js
    context/
      AuthContext.js
    navigation/
      MainNavigator.js
    screens/
      SplashScreen.js
      LoginScreen.js
      RegisterScreen.js
      HomeScreen.js
      DashboardScreen.js
      AcademicCoursesScreen.js
      UniversalCoursesScreen.js
      AdminCertificatesScreen.js
      ProfileScreen.js
    services/
      api.js
      firebase.js
```

## Prerequisites
- Node.js 18+
- npm
- Expo Go (for device testing)
- Backend running on LAN/tunnel reachable host

## Setup & Run
1. Install dependencies
```bash
cd frontend
npm install
```
2. Start app
```bash
npm start
```
3. Scan QR using Expo Go

## Environment Variables
Configure `frontend/.env`:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_DEVELOPER_VERIFY_PHONE`
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_API_BASE_URLS` (optional comma-separated fallbacks)

## Build (Android via EAS)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

## Known Limitations
- EAS artifact generation requires valid Expo account + internet access.
- Firebase OTP delivery depends on Firebase setup and telecom conditions.
- For admin login continuity, developer-code fallback is enabled in backend.

## Evaluator Demo Checklist
- Register and email OTP verification
- Login and JWT-protected API access
- Non-admin denied from admin-only routes
- Role-based navigation differs for student/mentor/admin
- PDF/image certificate upload works end-to-end
- Logout clears session
- App restart restores persisted session
