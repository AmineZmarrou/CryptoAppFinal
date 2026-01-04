import React, { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { ScreenShell } from '../components/ScreenShell';
import { TopBar } from '../components/TopBar';
import { Pill } from '../components/Pill';
import { styles } from '../styles/styles';
import { db } from '../utils/firebase';
import { formatChange, formatCurrency, formatQuantity } from '../utils/format';

export const DetailScreen = ({
  navigation,
  route,
  profile,
  coins,
  refreshing,
  fetchCoins,
  handleRefresh,
  handleLogout,
  user,
  addToPortfolio,
  showActionMessage,
  actionMessage,
}) => {
  const { coinId } = route.params || {};
  const coin = coins.find((item) => item.id === coinId) || null;
  const [localAmount, setLocalAmount] = useState('');
  const [portfolioMessage, setPortfolioMessage] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  const flashPortfolioMessage = (message) => {
    setPortfolioMessage(message);
    setTimeout(() => setPortfolioMessage(''), 2500);
  };

  const loadComments = async () => {
    if (!coinId) {
      return;
    }
    setCommentLoading(true);
    setCommentError('');
    try {
      const commentQuery = query(
        collection(db, 'comments'),
        where('coinId', '==', coinId),
      );
      const snapshot = await getDocs(commentQuery);
      const next = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setComments(next);
    } catch (err) {
      setCommentError(err.message || 'Erreur de commentaires.');
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [coinId]);

  const handleAdd = async () => {
    const normalized = localAmount.replace(',', '.');
    const quantity = Number.parseFloat(normalized);
    if (!coin) {
      flashPortfolioMessage('Selectionnez une crypto.');
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      flashPortfolioMessage('Quantite invalide.');
      return;
    }
    try {
      await addToPortfolio(coin.id, quantity);
      setLocalAmount('');
      flashPortfolioMessage(`${formatQuantity(quantity)} ${coin.symbol?.toUpperCase()} ajoute.`);
    } catch (err) {
      flashPortfolioMessage(err.message || 'Ajout impossible.');
    }
  };

  const handleCommentSubmit = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) {
      showActionMessage('Commentaire vide.');
      return;
    }
    if (!user) {
      setCommentError('Connexion requise.');
      return;
    }
    setCommentLoading(true);
    addDoc(collection(db, 'comments'), {
      coinId,
      userId: user.uid,
      userName: profile?.name || user.displayName || 'Utilisateur',
      body: trimmed,
      createdAt: serverTimestamp(),
    })
      .then((docRef) => {
        setComments((prev) => [
          {
            id: docRef.id,
            coinId,
            userId: user.uid,
            userName: profile?.name || user.displayName || 'Utilisateur',
            body: trimmed,
            createdAt: new Date(),
          },
          ...prev,
        ]);
        setCommentInput('');
      })
      .catch((err) => {
        setCommentError(err.message || 'Erreur de commentaire.');
      })
      .finally(() => {
        setCommentLoading(false);
      });
  };

  const change24h = coin?.market_data?.price_change_percentage_24h ?? 0;

  return (
    <ScreenShell>
      <TopBar profileName={profile?.name} onRefresh={handleRefresh} onLogout={handleLogout} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl tintColor="#66e3ff" refreshing={refreshing} onRefresh={fetchCoins} />
        }
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.inlineButton} onPress={() => navigation.goBack()}>
          <Text style={styles.inlineText}>Retour a la liste</Text>
        </Pressable>

        {coin ? (
          <>
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>{coin.name}</Text>
              <Text style={styles.listSubtitle}>
                {coin.symbol?.toUpperCase()} - Rang #{coin.market_cap_rank ?? '-'}
              </Text>
            </View>

            <View style={styles.heroCardLarge}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.label}>Prix actuel</Text>
                  <Text style={styles.price}>
                    {formatCurrency(coin.market_data?.current_price?.usd ?? 0)}
                  </Text>
                </View>
                <Pill label={formatChange(change24h)} tone={change24h >= 0 ? 'up' : 'down'} />
              </View>
              <View style={styles.divider} />
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.label}>Haut 24h</Text>
                  <Text style={styles.secondaryValue}>
                    {formatCurrency(coin.market_data?.high_24h?.usd ?? 0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.label}>Bas 24h</Text>
                  <Text style={styles.secondaryValue}>
                    {formatCurrency(coin.market_data?.low_24h?.usd ?? 0)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.listCard}>
              <Text style={styles.listSubtitle}>Ajouter au portefeuille</Text>
              <View style={styles.quantityRow}>
                <TextInput
                  style={styles.quantityInput}
                  placeholder="Quantite"
                  placeholderTextColor="#9fb1d1"
                  keyboardType="decimal-pad"
                  value={localAmount}
                  onChangeText={setLocalAmount}
                />
                <Pressable style={styles.secondaryButton} onPress={handleAdd}>
                  <Text style={styles.secondaryText}>Ajouter</Text>
                </Pressable>
              </View>
              {portfolioMessage ? (
                <Text style={styles.portfolioMessage}>{portfolioMessage}</Text>
              ) : null}
              <Pressable
                style={[styles.inlineButton, { marginTop: 12 }]}
                onPress={() => navigation.navigate('Portefeuille')}
              >
                <Text style={styles.inlineText}>Voir portefeuille</Text>
              </Pressable>
            </View>

            <View style={styles.listCard}>
              <Text style={styles.listTitle}>Commentaires</Text>
              <Text style={styles.listSubtitle}>Partage ton avis sur cette crypto.</Text>
              <View style={styles.commentRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Votre commentaire"
                  placeholderTextColor="#9fb1d1"
                  value={commentInput}
                  onChangeText={setCommentInput}
                />
                <Pressable
                  style={[styles.secondaryButton, commentLoading && styles.disabled]}
                  onPress={handleCommentSubmit}
                  disabled={commentLoading}
                >
                  <Text style={styles.secondaryText}>Envoyer</Text>
                </Pressable>
              </View>

              {commentError ? <Text style={styles.commentError}>{commentError}</Text> : null}

              {commentLoading && comments.length === 0 ? (
                <Text style={styles.commentMeta}>Chargement...</Text>
              ) : null}

              {comments.length === 0 ? (
                <Text style={styles.commentMeta}>Aucun commentaire pour le moment.</Text>
              ) : (
                comments.map((item) => (
                  <View key={item.id} style={styles.commentCard}>
                    <Text style={styles.commentAuthor}>{item.userName || 'Utilisateur'}</Text>
                    <Text style={styles.commentBody}>{item.body}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <View style={styles.listCard}>
            <Text style={styles.listSubtitle}>Aucune donnee crypto disponible.</Text>
          </View>
        )}

        {actionMessage ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{actionMessage}</Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
};

