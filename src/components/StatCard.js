import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles/styles';

export const StatCard = ({ label, value, accent }) => (
  <View style={[styles.statCard, { borderColor: accent || '#5dd2ff' }]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color: accent || '#eaf7ff' }]}>{value}</Text>
  </View>
);
