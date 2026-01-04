import { initializeApp, getApps } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBtbQv9k_LReTabTXcRFxSadAKzPp_BgZA',
  authDomain: 'cryptoapp-8c79a.firebaseapp.com',
  projectId: 'cryptoapp-8c79a',
  storageBucket: 'cryptoapp-8c79a.firebasestorage.app',
  messagingSenderId: '695549984070',
  appId: '1:695549984070:web:364957cfbb8dfbaac73947',
};

const googleAuthConfig = {
  webClientId: '695549984070-hjsckag97d1ml955mpui30js21rvkfl4.apps.googleusercontent.com',
  expoClientId: '695549984070-hjsckag97d1ml955mpui30js21rvkfl4.apps.googleusercontent.com',
};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db, firebaseConfig, googleAuthConfig };
