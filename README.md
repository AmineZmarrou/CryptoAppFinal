# CryptoApp

React Native (Expo) app with Firebase Auth + Firestore for a crypto portfolio
experience.

## Structure

- `App.js`, `src/`, `assets/`: frontend (Expo)
- `src/utils/firebase.js`: Firebase configuration

## Frontend setup

1. `npm install`
2. `npm run start`

Note: update Firebase config and Google client IDs in `src/utils/firebase.js`.

Scripts:
- `npm run start`
- `npm run android`
- `npm run ios`
- `npm run web`

## Firebase setup

1. Enable Email/Password and Google providers in Firebase Auth.
2. Create a Firestore database.
3. If prompted, create a composite index for `comments` on `coinId` + `createdAt`.
