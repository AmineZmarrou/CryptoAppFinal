import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { PortfolioScreen } from './src/screens/PortfolioScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { COIN_API_BASE, COIN_IDS, COIN_QUERY } from './src/utils/api';
import { auth, db, googleAuthConfig } from './src/utils/firebase';

const Stack = createNativeStackNavigator();

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [portfolio, setPortfolio] = useState({});
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const googleProxyBase = 'https://auth.expo.io/@aminezmarrou/CryptoApp';
  const googleReturnUrl = Linking.createURL('expo-auth-session');

  const buildGoogleAuthUrl = () => {
    const nonce = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const params = new URLSearchParams({
      client_id: googleAuthConfig.webClientId,
      redirect_uri: googleProxyBase,
      response_type: 'id_token',
      scope: 'openid profile email',
      nonce,
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const fetchCoins = useCallback(async () => {
    setRefreshing(true);
    try {
      setError('');
      const responses = await Promise.all(
        COIN_IDS.map(async (coinId) => {
          const response = await fetch(`${COIN_API_BASE}/${coinId}${COIN_QUERY}`);
          if (!response.ok) {
            throw new Error('API non disponible pour le moment.');
          }
          return response.json();
        })
      );
      setCoins(responses);
      setLastUpdated(new Date());
      return true;
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement.');
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  const showActionMessage = (message) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(''), 2500);
  };

  const handleRefresh = async () => {
    const ok = await fetchCoins();
    showActionMessage(ok ? 'Cours rafraichi' : 'Echec du rafraichissement');
  };

  const addToPortfolio = async (coinId, quantity) => {
    if (!user) {
      throw new Error('Utilisateur non authentifie.');
    }
    const docRef = doc(db, 'users', user.uid, 'portfolio', coinId);
    await setDoc(
      docRef,
      {
        coinId,
        quantity: increment(quantity),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    setPortfolio((prev) => ({
      ...prev,
      [coinId]: (prev[coinId] || 0) + quantity,
    }));
  };

  const loadPortfolio = useCallback(async (uid) => {
    setPortfolioLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'users', uid, 'portfolio'));
      const next = snapshot.docs.reduce((acc, item) => {
        const data = item.data();
        const key = data?.coinId || item.id;
        if (key) {
          acc[key] = data.quantity || 0;
        }
        return acc;
      }, {});
      setPortfolio(next);
    } catch (err) {
      console.error(err);
    } finally {
      setPortfolioLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      return;
    }
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        setProfile(snapshot.data());
        return;
      }
      const fallbackProfile = {
        name: firebaseUser.displayName || 'Utilisateur',
        email: firebaseUser.email || '',
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, fallbackProfile, { merge: true });
      setProfile(fallbackProfile);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleLogin = async () => {
    if (!authEmail || !authPassword) {
      setAuthMessage('Email et mot de passe requis.');
      return;
    }
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setAuthMessage('');
      setAuthPassword('');
    } catch (err) {
      setAuthMessage(err.message || 'Connexion echouee.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!authName || !authEmail || !authPassword) {
      setAuthMessage('Tous les champs sont requis.');
      return;
    }
    setAuthLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      await updateProfile(result.user, { displayName: authName });
      await setDoc(
        doc(db, 'users', result.user.uid),
        {
          name: authName,
          email: authEmail,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      setProfile({ name: authName, email: authEmail });
      setAuthMessage('');
      setAuthPassword('');
    } catch (err) {
      setAuthMessage(err.message || 'Inscription echouee.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetRequest = async () => {
    if (!authEmail) {
      setAuthMessage('Email requis pour reset.');
      return;
    }
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, authEmail);
      setAuthMessage('Email de reinitialisation envoye.');
    } catch (err) {
      setAuthMessage(err.message || 'Reset echoue.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth).catch((err) => console.error(err));
  };

  const handleGoogleLogin = async () => {
    if (!googleAuthConfig.webClientId) {
      setAuthMessage('Connexion Google indisponible.');
      return;
    }
    setAuthMessage('');
    try {
      const authUrl = buildGoogleAuthUrl();
      const proxyUrl = `${googleProxyBase}/start?${new URLSearchParams({
        authUrl,
        returnUrl: googleReturnUrl,
      }).toString()}`;
      const result = await WebBrowser.openAuthSessionAsync(proxyUrl, googleReturnUrl);
      if (result.type !== 'success' || !result.url) {
        return;
      }
      const parsed = new URL(result.url, 'https://phony.example');
      const params = new URLSearchParams(parsed.search);
      if (parsed.hash) {
        new URLSearchParams(parsed.hash.replace(/^#/, '')).forEach((value, key) => {
          params.set(key, value);
        });
      }
      const idToken = params.get('id_token');
      if (!idToken) {
        setAuthMessage('Connexion Google echouee.');
        return;
      }
      setAuthLoading(true);
      const credential = GoogleAuthProvider.credential(idToken);
      const resultAuth = await signInWithCredential(auth, credential);
      const nextProfile = {
        name: resultAuth.user.displayName || 'Utilisateur',
        email: resultAuth.user.email || '',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', resultAuth.user.uid), nextProfile, { merge: true });
    } catch (err) {
      setAuthMessage(err.message || 'Connexion Google echouee.');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setPortfolio({});
        setAuthMode('login');
        return;
      }
      loadProfile(firebaseUser);
      loadPortfolio(firebaseUser.uid);
    });
    return unsubscribe;
  }, [loadProfile, loadPortfolio]);


  const holdings = useMemo(
    () =>
      Object.entries(portfolio)
        .map(([coinId, quantity]) => {
          const coin = coins.find((item) => item.id === coinId);
          return { coinId, quantity, coin };
        })
        .filter((item) => item.quantity > 0),
    [portfolio, coins]
  );

  const totalUsd = useMemo(
    () =>
      holdings.reduce((total, item) => {
        const priceUsd = item.coin?.market_data?.current_price?.usd ?? 0;
        return total + item.quantity * priceUsd;
      }, 0),
    [holdings]
  );

  if (!fontsLoaded) {
    return null;
  }

  if (!user) {
    return (
      <AuthScreen
        authMode={authMode}
        authName={authName}
        authEmail={authEmail}
        authPassword={authPassword}
        authMessage={authMessage}
        authLoading={authLoading}
        setAuthMode={setAuthMode}
        setAuthName={setAuthName}
        setAuthEmail={setAuthEmail}
        setAuthPassword={setAuthPassword}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleResetRequest={handleResetRequest}
        handleGoogleLogin={handleGoogleLogin}
        googleDisabled={!googleAuthConfig.webClientId || authLoading}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Accueil">
          {(props) => (
            <HomeScreen
              {...props}
              profile={profile}
              coins={coins}
              refreshing={refreshing}
              lastUpdated={lastUpdated}
              error={error}
              actionMessage={actionMessage}
              loading={loading}
              fetchCoins={fetchCoins}
              handleRefresh={handleRefresh}
              handleLogout={handleLogout}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Detail">
          {(props) => (
            <DetailScreen
              {...props}
              profile={profile}
              coins={coins}
              refreshing={refreshing}
              fetchCoins={fetchCoins}
              handleRefresh={handleRefresh}
              handleLogout={handleLogout}
              user={user}
              addToPortfolio={addToPortfolio}
              showActionMessage={showActionMessage}
              actionMessage={actionMessage}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Portefeuille">
          {(props) => (
            <PortfolioScreen
              {...props}
              profile={profile}
              refreshing={refreshing}
              fetchCoins={fetchCoins}
              handleRefresh={handleRefresh}
              handleLogout={handleLogout}
              portfolioLoading={portfolioLoading}
              totalUsd={totalUsd}
              holdings={holdings}
              actionMessage={actionMessage}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Profil">
          {(props) => (
            <ProfileScreen
              {...props}
              profile={profile}
              handleRefresh={handleRefresh}
              handleLogout={handleLogout}
              totalUsd={totalUsd}
              holdings={holdings}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
