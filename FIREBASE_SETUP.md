# Firebase Firestore Setup for Kesher Project

This guide will help you set up Firebase Firestore database for the Kesher organizational communication platform.

## Prerequisites

- Node.js and npm installed
- A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))

## Step 1: Install Firebase Dependencies

```bash
npm install firebase
```

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "kesher-company")
4. Follow the setup wizard
5. Enable Google Analytics (optional)

## Step 3: Enable Firestore Database

1. In your Firebase project console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database (choose the closest to your users)

## Step 4: Get Firebase Configuration

1. In your Firebase project console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web" (</>) 
4. Register your app with a nickname (e.g., "kesher-web")
5. Copy the configuration object

## Step 5: Set Environment Variables

1. Create a `.env` file in the root of your project
2. Copy the contents from `firebase.env.example` and replace with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## Step 6: Enable Authentication (Optional)

If you want to use Firebase Authentication:

1. In Firebase console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. You can also enable other providers as needed

## Step 7: Set Up Firestore Security Rules

In Firebase console, go to "Firestore Database" > "Rules" and set up appropriate security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read/write messages they're involved in
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || 
         resource.data.recipientId == request.auth.uid);
    }
    
    // Allow managers to read/write schedules
    match /schedules/{scheduleId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow managers to read/write reports
    match /reports/{reportId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 8: Seed Sample Data (Optional)

To populate your database with sample data, you can use the provided seeder:

```javascript
// In your browser console or create a temporary component
import { seedDatabase } from '@/utils/seedData';

// Run the seeder
await seedDatabase();
```

## Step 9: Test the Integration

1. Start your development server: `npm run dev`
2. Open the application in your browser
3. Check the browser console for any Firebase-related errors
4. Try logging in with the sample credentials from the seeder

## Project Structure

```
src/
├── lib/
│   └── firebase.ts          # Firebase configuration
├── services/
│   └── firestore.ts         # Firestore service layer
├── hooks/
│   └── useFirestore.ts      # React hooks for Firestore
├── contexts/
│   └── AuthContext.tsx      # Authentication context
└── utils/
    └── seedData.ts          # Sample data seeder
```

## Available Collections

The application uses the following Firestore collections:   

- **users**: User profiles and authentication data
- **messages**: Internal messages, emails, and notifications
- **schedules**: Work schedules and shift management
- **reports**: Performance and operational reports

## Features Included

✅ **Real-time data synchronization** with Firestore listeners
✅ **Authentication system** with Firebase Auth
✅ **CRUD operations** for all collections
✅ **Type-safe** TypeScript interfaces
✅ **React hooks** for easy data access
✅ **Sample data seeder** for testing
✅ **Error handling** and loading states

## Troubleshooting

### Common Issues

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This usually happens when Firebase is initialized multiple times
   - Make sure you're only importing and initializing Firebase once

2. **"Missing or insufficient permissions"**
   - Check your Firestore security rules
   - Make sure you're authenticated if required

3. **Environment variables not loading**
   - Make sure your `.env` file is in the project root
   - Restart your development server after adding environment variables

4. **"Network request failed"**
   - Check your internet connection
   - Verify your Firebase project is active
   - Check if your IP is whitelisted (if you have IP restrictions)

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)

## Next Steps

1. **Customize the data models** in `src/services/firestore.ts`
2. **Add more security rules** based on your requirements
3. **Implement offline support** using Firestore's offline capabilities
4. **Add data validation** using Firebase Functions
5. **Set up monitoring** and analytics in Firebase Console 