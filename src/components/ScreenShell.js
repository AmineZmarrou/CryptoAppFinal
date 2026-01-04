import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles/styles';

export const ScreenShell = ({ children }) => (
  <LinearGradient colors={['#05070f', '#0c152e', '#071a25']} style={styles.screen}>
    <StatusBar style="light" />
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      {children}
    </SafeAreaView>
  </LinearGradient>
);
