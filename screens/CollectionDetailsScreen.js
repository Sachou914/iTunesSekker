import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, ActivityIndicator, Alert, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';

export default function CollectionDetailsScreen({ route, navigation }) {
  const { item } = route.params;
  const [lyrics, setLyrics] = useState('');
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [sound, setSound] = useState(null);
  const [buttonScale] = useState(new Animated.Value(1));
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchLyrics = async () => {
      setLoadingLyrics(true);
      try {
        const response = await fetch(`https://api.lyrics.ovh/v1/${item.artistName}/${item.trackName}`);
        const data = await response.json();
        setLyrics(data.lyrics || '');
      } catch (error) {
        setLyrics('');
      }
      setLoadingLyrics(false);
    };

    const fetchRating = async () => {
      try {
        const storedRatings = await AsyncStorage.getItem('ratings');
        const parsedRatings = storedRatings ? JSON.parse(storedRatings) : {};
        if (parsedRatings[item.trackId]) {
          setRating(parsedRatings[item.trackId]);
        }
      } catch (err) {
        console.error('Error loading rating', err);
      }
    };

    fetchLyrics();
    fetchRating();
  }, []);

  async function playSound() {
    if (!item.previewUrl) {
      alert('No preview available');
      return;
    }
    const { sound } = await Audio.Sound.createAsync({ uri: item.previewUrl });
    setSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();
  };

  const removeFromCollection = async () => {
    animateButton();
    try {
      const stored = await AsyncStorage.getItem('myCollection');
      let collection = stored ? JSON.parse(stored) : [];
      collection = collection.filter(track => track.trackId !== item.trackId);
      await AsyncStorage.setItem('myCollection', JSON.stringify(collection));
      Alert.alert('Removed', 'Track removed from collection.');
      navigation.goBack();
    } catch (error) {
      console.error(error);
    }
  };

  const StarRating = ({ rating }) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FontAwesome
          key={star}
          name={star <= rating ? 'star' : 'star-o'}
          size={28}
          color="#FFD700"
          style={{ marginHorizontal: 3 }}
        />
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: item.artworkUrl100 }} style={styles.cover} />
      <Text style={styles.trackName}>{item.trackName}</Text>
      <Text style={styles.artistName}>{item.artistName}</Text>
      {item.collectionName && <Text style={styles.albumName}>Album: {item.collectionName}</Text>}

      {/* Rating affiché */}
      <Text style={styles.sectionTitle}>Ma Note</Text>
      <StarRating rating={rating} />

      {/* Play Preview */}
      {item.previewUrl ? (
        <Animated.View style={{ transform: [{ scale: buttonScale }], marginBottom: 10 }}>
          <Pressable
            style={styles.addButton}
            onPress={() => {
              animateButton();
              playSound();
            }}
          >
            <Text style={styles.addButtonText}>▶️ Ecouter l'extrait</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <Text style={{ marginBottom: 15, color: '#999', fontStyle: 'italic' }}>No preview available.</Text>
      )}

      {/* Remove Button */}
      <Animated.View style={{ transform: [{ scale: buttonScale }], marginBottom: 20 }}>
        <Pressable style={styles.removeButton} onPress={removeFromCollection}>
          <Text style={styles.removeButtonText}>Retirer de Ma Playlist</Text>
        </Pressable>
      </Animated.View>

      {/* Lyrics */}
      <Text style={styles.sectionTitle}>Paroles</Text>
      {loadingLyrics ? (
        <ActivityIndicator size="small" color="#222" />
      ) : lyrics && lyrics !== '' ? (
        <Text style={styles.lyricsText}>{lyrics}</Text>
      ) : (
        <Text style={[styles.lyricsText, { fontStyle: 'italic', color: '#999' }]}>Aucune parole disponible.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  cover: { width: 200, height: 200, borderRadius: 10, marginBottom: 20 },
  trackName: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, color: '#222' },
  artistName: { fontSize: 18, color: '#555', marginBottom: 10 },
  albumName: { fontSize: 14, color: '#777', marginBottom: 20 },
  removeButton: { backgroundColor: '#e53935', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  removeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 },
  lyricsText: { fontSize: 14, color: '#333', textAlign: 'center', marginBottom: 20 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
});
