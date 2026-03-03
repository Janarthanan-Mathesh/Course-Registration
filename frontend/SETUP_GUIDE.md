# 🚀 Quick Setup Guide

Follow these steps to get the Course Registration App running on your machine.

---

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js (v14 or higher) installed
- [ ] npm or yarn package manager
- [ ] Expo CLI installed globally
- [ ] Expo Go app on your mobile device (Android/iOS)
- [ ] A code editor (VS Code recommended)

---

## Step-by-Step Setup

### Step 1: Extract the Project

```bash
# Extract the zip file to your desired location
# Navigate to the project folder
cd CourseRegistrationApp
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# OR using yarn
yarn install
```

This will install all required packages listed in `package.json`.

### Step 3: Start the Development Server

```bash
# Start Expo
npm start

# OR
expo start
```

You should see a QR code in your terminal/browser.

### Step 4: Run on Your Device

**Option A: Using Expo Go App (Recommended for Testing)**

1. Download "Expo Go" app from Play Store (Android) or App Store (iOS)
2. Open Expo Go app
3. Scan the QR code from Step 3
4. The app will load on your device

**Option B: Using Emulator**

For Android:
```bash
npm run android
```

For iOS (Mac only):
```bash
npm run ios
```

---

## Testing the App

### Default Login Credentials (Mock Data)

You can login with any email and password since it's using mock data:

- **Email**: `janarthanan.ad23@bitsathy.ac.in`
- **Password**: `any_password`

OR

Simply register a new account - it will work with mock authentication.

---

## Project Features to Test

1. ✅ **Authentication**
   - Login screen
   - Registration with form validation
   - Password visibility toggle

2. ✅ **Home Screen**
   - View statistics cards
   - Quick action buttons
   - Recent courses

3. ✅ **Dashboard**
   - Enrolled courses
   - Progress tracking
   - Certificates section

4. ✅ **Academic Courses**
   - Semester filtering
   - Course registration
   - College domain-based access

5. ✅ **Universal Courses**
   - Search functionality
   - Filter by provider and skill level
   - Wishlist feature
   - Course rating display

6. ✅ **Profile**
   - View/Edit profile
   - Social links
   - Account activity
   - Logout

---

## Database Setup (Optional - For Backend Integration)

If you want to set up the database for future backend integration:

### MySQL/PostgreSQL:

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE course_registration;

# Import schema
USE course_registration;
source database/schema_mysql.sql;
```

### MongoDB:

```bash
# Start MongoDB
mongod

# In another terminal, open MongoDB shell
mongo

# Create database
use course_registration

# Copy and paste the content from database/schema_mongodb.js
```

---

## Troubleshooting

### Problem: "expo: command not found"

**Solution:**
```bash
npm install -g expo-cli
```

### Problem: Dependencies installation fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Problem: Metro bundler issues

**Solution:**
```bash
# Clear Metro bundler cache
expo start -c
```

### Problem: App not loading on device

**Solution:**
- Make sure your phone and computer are on the same WiFi network
- Check if firewall is blocking the connection
- Try using tunnel mode: `expo start --tunnel`

---

## File Structure Overview

```
CourseRegistrationApp/
├── App.js                      # Main entry point
├── package.json                # Dependencies
├── app.json                    # Expo configuration
│
├── src/
│   ├── screens/                # All screen components
│   ├── navigation/             # Navigation setup
│   ├── context/                # State management
│   └── data/                   # Mock data
│
├── database/                   # Database schemas
│   ├── schema_mysql.sql
│   ├── schema_mongodb.js
│   └── DATABASE_DOCUMENTATION.md
│
└── README.md                   # Full documentation
```

---

## Next Steps

1. **Explore the App**: Try all features and screens
2. **Review Code**: Check the code structure and components
3. **Backend Integration**: Connect to a real backend (optional)
4. **Customization**: Modify colors, add features, etc.
5. **Database Setup**: Set up database for production use

---

## Important Notes

⚠️ **This is a Frontend-Only Implementation**

- Currently uses mock data (no real backend)
- Authentication is simulated
- Data doesn't persist between app restarts
- For production use, connect to a real backend

---

## Resources

- **React Native Docs**: https://reactnative.dev/
- **Expo Docs**: https://docs.expo.dev/
- **React Navigation**: https://reactnavigation.org/
- **React Native Paper**: https://callstack.github.io/react-native-paper/

---

## Support

For issues or questions:
1. Check the main README.md file
2. Review database documentation
3. Check React Native/Expo documentation
4. Contact the developer

---

## Development Tips

1. **Hot Reload**: Changes auto-refresh in development mode
2. **Console Logs**: Check Expo terminal for console.log output
3. **Debugging**: Use React Native Debugger or Chrome DevTools
4. **State Management**: Currently using Context API (can upgrade to Redux)

---

**Happy Coding! 🎉**

Your app should now be running successfully. Explore all features and customize as needed!
