import React from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { TopBar } from '../components/TopBar';
import { styles } from '../styles/styles';
import { formatCurrency, formatQuantity } from '../utils/format';

export const PortfolioScreen = ({
  navigation,
  profile,
  refreshing,
  fetchCoins,
  handleRefresh,
  handleLogout,
  portfolioLoading,
  totalUsd,
  holdings,
  actionMessage,
}) => (
  <ScreenShell>
    <TopBar profileName={profile?.name} onRefresh={handleRefresh} onLogout={handleLogout} />
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl tintColor="#66e3ff" refreshing={refreshing} onRefresh={fetchCoins} />
      }
    >
      {portfolioLoading ? (
        <View style={styles.listCard}>
          <Text style={styles.listSubtitle}>Chargement du portefeuille...</Text>
        </View>
      ) : null}

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Total portefeuille</Text>
        <Text style={styles.listValue}>{formatCurrency(totalUsd)}</Text>
      </View>

      {holdings.length === 0 ? (
        <View style={styles.listCard}>
          <Text style={styles.listSubtitle}>Aucune position pour le moment.</Text>
        </View>
      ) : (
        holdings.map((item) => (
          <View key={item.coinId} style={styles.listCard}>
            <View>
              <Text style={styles.listTitle}>{item.coin?.name ?? item.coinId}</Text>
              <Text style={styles.listSubtitle}>
                {formatQuantity(item.quantity)} {item.coin?.symbol?.toUpperCase() ?? ''}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.listValue}>
                {formatCurrency((item.coin?.market_data?.current_price?.usd ?? 0) * item.quantity)}
              </Text>
              <Text style={styles.listChange}>
                {formatCurrency(item.coin?.market_data?.current_price?.usd ?? 0)} / unit
              </Text>
            </View>
          </View>
        ))
      )}

      <Pressable style={styles.inlineButton} onPress={() => navigation.navigate('Accueil')}>
        <Text style={styles.inlineText}>Retour a l accueil</Text>
      </Pressable>

      {actionMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{actionMessage}</Text>
        </View>
      ) : null}
    </ScrollView>
  </ScreenShell>
);
