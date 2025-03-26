import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, ActivityIndicator, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';

export default function DetailsScreen({ route, navigation }) {
  const { item, itemType } = route.params;
  const [lyrics, setLyrics] = useState('');
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [sound, setSound] = useState(null);
  const [buttonScale] = useState(new Animated.Value(1));
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchLyrics = async () => {
      if (itemType !== 'song') return;
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
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
    ]).start();
  };

  const handleRating = async (newRating) => {
    setRating(newRating);
    try {
      const stored = await AsyncStorage.getItem('ratings');
      const allRatings = stored ? JSON.parse(stored) : {};
      allRatings[item.trackId] = newRating;
      await AsyncStorage.setItem('ratings', JSON.stringify(allRatings));
    } catch (err) {
      console.error('Error saving rating', err);
    }
  };

  const StarRating = ({ currentRating, onRate }) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <Pressable key={star} onPress={() => onRate(star)}>
          <FontAwesome
            name={star <= currentRating ? 'star' : 'star-o'}
            size={28}
            color="#FFD700"
            style={{ marginHorizontal: 3 }}
          />
        </Pressable>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: item.artworkUrl100 }} style={styles.cover} />
      <Text style={styles.trackName}>
        {itemType === 'album' ? item.collectionName : itemType === 'musicArtist' ? item.artistName : item.trackName}
      </Text>
      <Text style={styles.artistName}>{item.artistName}</Text>
      {item.collectionName && <Text style={styles.albumName}>Album: {item.collectionName}</Text>}
      {item.releaseDate && itemType === 'album' && <Text style={styles.albumName}>Date: {item.releaseDate.split('T')[0]}</Text>}

      {itemType === 'album' && (
        <Pressable
          style={[styles.addButton, { backgroundColor: '#333', marginBottom: 15 }]}
          onPress={() => navigation.navigate('AlbumOrArtistDetails', { item, itemType: 'album' })}
        >
          <Text style={styles.addButtonText}>Voir les morceaux de l'album</Text>
        </Pressable>
      )}

      {itemType === 'musicArtist' && (
        <Pressable
          style={[styles.addButton, { backgroundColor: '#333', marginBottom: 15 }]}
          onPress={() => navigation.navigate('AlbumOrArtistDetails', { item, itemType: 'artist' })}
        >
          <Text style={styles.addButtonText}>Voir les sons populaires</Text>
        </Pressable>
      )}

      {item.previewUrl && (
        <Animated.View style={{ transform: [{ scale: buttonScale }], marginBottom: 10 }}>
          <Pressable style={styles.addButton} onPress={() => { animateButton(); playSound(); }}>
            <Text style={styles.addButtonText}>▶️ Play Preview</Text>
          </Pressable>
        </Animated.View>
      )}

      {itemType === 'song' && (
        <Animated.View style={{ transform: [{ scale: buttonScale }], marginBottom: 25 }}>
          <Pressable
            style={styles.addButton}
            onPress={async () => {
              animateButton();
              try {
                const stored = await AsyncStorage.getItem('myCollection');
                let collection = stored ? JSON.parse(stored) : [];
                const exists = collection.find(track => track.trackId === item.trackId);
                if (!exists) {
                  collection.push(item);
                  await AsyncStorage.setItem('myCollection', JSON.stringify(collection));
                  alert('Added to your collection!');
                } else {
                  alert('Already in your collection!');
                }
              } catch (error) {
                alert('Error saving track');
              }
            }}
          >
            <Text style={styles.addButtonText}>+ Ajouter à ma Playlist</Text>
          </Pressable>
        </Animated.View>
      )}

      {itemType === 'song' && (
        <>
          <Text style={styles.sectionTitle}>Notation</Text>
          <StarRating currentRating={rating} onRate={handleRating} />
        </>
      )}

      {itemType === 'song' && (
        <>
          <Text style={styles.sectionTitle}>Lyrics</Text>
          {loadingLyrics ? (
            <ActivityIndicator size="small" color="#222" />
          ) : lyrics !== '' ? (
            <Text style={styles.lyricsText}>{lyrics}</Text>
          ) : (
            <Text style={[styles.lyricsText, { fontStyle: 'italic', color: '#999' }]}>No lyrics available.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  cover: { width: 200, height: 200, borderRadius: 10, marginBottom: 20 },
  trackName: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, color: '#222' },
  artistName: { fontSize: 18, color: '#555', marginBottom: 10 },
  albumName: { fontSize: 14, color: '#777', marginBottom: 10 },
  addButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10, marginTop: 10 },
  lyricsText: { fontSize: 14, color: '#333', textAlign: 'center', marginBottom: 20 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
});
