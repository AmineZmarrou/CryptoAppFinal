import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles/styles';

export const Pill = ({ label, tone }) => (
  <View style={[styles.pill, tone === 'up' ? styles.pillUp : styles.pillDown]}>
    <Text style={styles.pillText}>{label}</Text>
  </View>
);
