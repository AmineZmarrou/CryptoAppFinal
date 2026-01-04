import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../styles/styles';

export const TopBar = ({ profileName, onRefresh, onLogout }) => (
  <View style={styles.topBar}>
    <View>
      <Text style={styles.brand}>Aurora Vault</Text>
      <Text style={styles.profile}>{profileName || 'Utilisateur'}</Text>
    </View>
    <View style={styles.topActions}>
      <Pressable style={styles.iconButton} onPress={onRefresh}>
        <Text style={styles.iconText}>R</Text>
      </Pressable>
      <Pressable style={styles.ghostButton} onPress={onLogout}>
        <Text style={styles.ghostText}>Sortir</Text>
      </Pressable>
    </View>
  </View>
);
