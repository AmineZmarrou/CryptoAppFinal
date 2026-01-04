import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenShell } from '../components/ScreenShell';
import { TopBar } from '../components/TopBar';
import { StatCard } from '../components/StatCard';
import { Pill } from '../components/Pill';
import { styles } from '../styles/styles';
import { formatChange, formatCurrency, formatNumber } from '../utils/format';

export const HomeScreen = ({
  navigation,
  profile,
  coins,
  refreshing,
  lastUpdated,
  error,
  actionMessage,
  loading,
  fetchCoins,
  handleRefresh,
  handleLogout,
}) => {
  useFocusEffect(
    useCallback(() => {
      fetchCoins();
      const intervalId = setInterval(fetchCoins, 30000);
      return () => clearInterval(intervalId);
    }, [fetchCoins])
  );

  const featuredCoin = coins[0] || null;
  const change = featuredCoin?.market_data?.price_change_percentage_24h ?? 0;

  return (
    <ScreenShell>
      <TopBar profileName={profile?.name} onRefresh={handleRefresh} onLogout={handleLogout} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl tintColor="#66e3ff" refreshing={refreshing} onRefresh={fetchCoins} />
        }
      >
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <Text style={styles.kicker}>Market Pulse</Text>
            <Text style={styles.pageTitle}>{featuredCoin?.name || 'Top Crypto'}</Text>
            <Text style={styles.subtitle}>Clique une crypto pour plus de details.</Text>
            {lastUpdated && (
              <Text style={styles.meta}>Maj: {lastUpdated.toLocaleTimeString()}</Text>
            )}
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.badgeLabel}>24h</Text>
            <Text style={styles.badgeValue}>{formatChange(change)}</Text>
          </View>
        </View>

        <View style={styles.heroCardLarge}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.label}>Prix actuel</Text>
              <Text style={styles.price}>
                {formatCurrency(featuredCoin?.market_data?.current_price?.usd ?? 0)}
              </Text>
            </View>
            <Pill label={formatChange(change)} tone={change >= 0 ? 'up' : 'down'} />
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.label}>Haut 24h</Text>
              <Text style={styles.secondaryValue}>
                {formatCurrency(featuredCoin?.market_data?.high_24h?.usd ?? 0)}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>Bas 24h</Text>
              <Text style={styles.secondaryValue}>
                {formatCurrency(featuredCoin?.market_data?.low_24h?.usd ?? 0)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statGrid}>
          <StatCard
            label="Market Cap"
            value={formatCurrency(featuredCoin?.market_data?.market_cap?.usd ?? 0)}
            accent="#66e3ff"
          />
          <StatCard
            label="Volume 24h"
            value={formatCurrency(featuredCoin?.market_data?.total_volume?.usd ?? 0)}
            accent="#ffc857"
          />
          <StatCard
            label="Rang CoinGecko"
            value={`#${featuredCoin?.market_cap_rank ?? '-'}`}
            accent="#8ee6c1"
          />
          <StatCard
            label="Supply"
            value={formatNumber(featuredCoin?.market_data?.circulating_supply)}
          />
        </View>

        <View style={styles.quickRow}>
          <Pressable style={styles.quickCard} onPress={() => navigation.navigate('Portefeuille')}>
            <Text style={styles.quickTitle}>Portefeuille</Text>
            <Text style={styles.quickSubtitle}>Voir vos positions</Text>
          </Pressable>
          <Pressable style={styles.quickCard} onPress={() => navigation.navigate('Profil')}>
            <Text style={styles.quickTitle}>Profil</Text>
            <Text style={styles.quickSubtitle}>Infos utilisateur</Text>
          </Pressable>
        </View>

        <View style={styles.quickRow}>
          <Pressable
            style={styles.quickCard}
            onPress={() =>
              featuredCoin ? navigation.navigate('Detail', { coinId: featuredCoin.id }) : null
            }
          >
            <Text style={styles.quickTitle}>Detail</Text>
            <Text style={styles.quickSubtitle}>Explorer la premiere crypto</Text>
          </Pressable>
          <View style={styles.quickCard}>
            <Text style={styles.quickTitle}>Commentaires</Text>
            <Text style={styles.quickSubtitle}>Donner votre avis</Text>
          </View>
        </View>

        <View style={styles.listSection}>
          {coins.length === 0 ? (
            <View style={styles.listCard}>
              <Text style={styles.listSubtitle}>Aucune donnee crypto disponible.</Text>
            </View>
          ) : (
            coins.map((coin) => (
              <Pressable
                key={coin.id}
                style={styles.listCard}
                onPress={() => navigation.navigate('Detail', { coinId: coin.id })}
              >
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.listTitle}>{coin.name}</Text>
                    <Text style={styles.listSubtitle}>
                      {coin.symbol?.toUpperCase()} - Rang #{coin.market_cap_rank ?? '-'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.listValue}>
                      {formatCurrency(coin.market_data?.current_price?.usd ?? 0)}
                    </Text>
                    <Text style={styles.listChange}>
                      {formatChange(coin.market_data?.price_change_percentage_24h ?? 0)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {actionMessage ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{actionMessage}</Text>
          </View>
        ) : null}

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#66e3ff" />
            <Text style={styles.loadingText}>Chargement des donnees...</Text>
          </View>
        )}
      </ScrollView>
    </ScreenShell>
  );
};
