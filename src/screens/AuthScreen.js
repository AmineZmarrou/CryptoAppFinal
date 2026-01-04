import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { styles } from '../styles/styles';

export const AuthScreen = ({
  authMode,
  authName,
  authEmail,
  authPassword,
  authMessage,
  authLoading,
  setAuthMode,
  setAuthName,
  setAuthEmail,
  setAuthPassword,
  handleLogin,
  handleRegister,
  handleResetRequest,
  handleGoogleLogin,
  googleDisabled,
}) => (
  <ScreenShell>
    <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.heroCard}>
        <Text style={styles.brand}>Aurora Vault</Text>
        <Text style={styles.heroTitle}>Acces securise aux marches crypto.</Text>
        <Text style={styles.heroSubtitle}>
          Connecte toi pour suivre les prix et gerer ton portefeuille.
        </Text>
      </View>

      <View style={styles.authCard}>
        <Text style={styles.authTitle}>
          {authMode === 'login'
            ? 'Connexion'
            : authMode === 'register'
            ? 'Inscription'
            : 'Reset mot de passe'}
        </Text>

        {authMode === 'register' && (
          <>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom complet"
              placeholderTextColor="#9fb1d1"
              value={authName}
              onChangeText={setAuthName}
            />
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="email@exemple.com"
          placeholderTextColor="#9fb1d1"
          autoCapitalize="none"
          keyboardType="email-address"
          value={authEmail}
          onChangeText={setAuthEmail}
        />

        {authMode !== 'reset' && (
          <>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#9fb1d1"
              secureTextEntry
              value={authPassword}
              onChangeText={setAuthPassword}
            />
          </>
        )}

        <Pressable
          style={[styles.primaryButton, authLoading && styles.disabled]}
          onPress={
            authMode === 'login'
              ? handleLogin
              : authMode === 'register'
              ? handleRegister
              : handleResetRequest
          }
          disabled={authLoading}
        >
          <Text style={styles.primaryText}>
            {authLoading
              ? 'Chargement...'
              : authMode === 'login'
              ? 'Connexion'
              : authMode === 'register'
              ? 'Creer un compte'
              : 'Envoyer reset'}
          </Text>
        </Pressable>

        {authMode !== 'reset' && (
          <Pressable
            style={[styles.googleButton, (authLoading || googleDisabled) && styles.disabled]}
            onPress={handleGoogleLogin}
            disabled={authLoading || googleDisabled}
          >
            <Text style={styles.googleText}>Continuer avec Google</Text>
          </Pressable>
        )}

        {authMessage ? <Text style={styles.authMessage}>{authMessage}</Text> : null}
      </View>

      <View style={styles.authLinks}>
        {authMode !== 'login' && (
          <Pressable onPress={() => setAuthMode('login')}>
            <Text style={styles.linkText}>Deja un compte ? Connexion</Text>
          </Pressable>
        )}
        {authMode !== 'register' && (
          <Pressable onPress={() => setAuthMode('register')}>
            <Text style={styles.linkText}>Creer un compte</Text>
          </Pressable>
        )}
        {authMode !== 'reset' && (
          <Pressable onPress={() => setAuthMode('reset')}>
            <Text style={styles.linkText}>Mot de passe oublie</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  </ScreenShell>
);
