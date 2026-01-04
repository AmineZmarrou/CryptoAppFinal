import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { TopBar } from '../components/TopBar';
import { styles } from '../styles/styles';
import { formatCurrency } from '../utils/format';

export const ProfileScreen = ({
  navigation,
  profile,
  handleRefresh,
  handleLogout,
  totalUsd,
  holdings,
}) => (
  <ScreenShell>
    <TopBar profileName={profile?.name} onRefresh={handleRefresh} onLogout={handleLogout} />
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.profileTitle}>Profil</Text>
        <Text style={styles.profileLabel}>Nom</Text>
        <Text style={styles.profileValue}>{profile?.name || '-'}</Text>
        <Text style={styles.profileLabel}>Email</Text>
        <Text style={styles.profileValue}>{profile?.email || '-'}</Text>
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Portefeuille</Text>
        <Text style={styles.listSubtitle}>Valeur totale et nombre de positions.</Text>
        <View style={styles.profileRow}>
          <Text style={styles.profileValue}>{formatCurrency(totalUsd)}</Text>
          <Text style={styles.profileMeta}>{holdings.length} actifs</Text>
        </View>
      </View>

      <Pressable style={styles.inlineButton} onPress={() => navigation.navigate('Accueil')}>
        <Text style={styles.inlineText}>Retour a l accueil</Text>
      </Pressable>
    </ScrollView>
  </ScreenShell>
);
