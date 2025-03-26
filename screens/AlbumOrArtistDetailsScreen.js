import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function AlbumOrArtistDetailsScreen({ route, navigation }) {
  const { item, itemType } = route.params;
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        let url = '';
        if (itemType === 'album') {
          url = `https://itunes.apple.com/lookup?id=${item.collectionId}&entity=song`;
        } else if (itemType === 'artist') {
          url = `https://itunes.apple.com/lookup?id=${item.artistId}&entity=song&limit=15`;
        }
        const response = await fetch(url);
        const data = await response.json();
        if (itemType === 'album') {
          setTracks(data.results.filter(result => result.wrapperType === 'track'));
        } else if (itemType === 'artist') {
          setTracks(data.results.filter(result => result.wrapperType === 'track'));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.artworkUrl100 }} style={styles.cover} />
      <Text style={styles.title}>
        {itemType === 'album' ? item.collectionName : item.artistName}
      </Text>
      {itemType === 'album' && item.releaseDate && (
        <Text style={styles.subtitle}>
          Date: {item.releaseDate.split('T')[0]}
        </Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#222" style={{ marginVertical: 20 }} />
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(track, index) => track.trackId?.toString() || index.toString()}
          renderItem={({ item: track }) => (
            <TouchableOpacity
              style={styles.trackCard}
              onPress={() => navigation.navigate('Details', { item: track, itemType: 'song' })}
            >
              <Image source={{ uri: track.artworkUrl60 }} style={styles.trackImage} />
              <View style={styles.trackInfo}>
                <Text style={styles.trackName}>{track.trackName}</Text>
                <Text style={styles.artistName}>{track.artistName}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  cover: { width: 150, height: 150, borderRadius: 8, alignSelf: 'center', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  subtitle: { textAlign: 'center', marginBottom: 15, color: '#666' },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  trackImage: { width: 50, height: 50, borderRadius: 5 },
  trackInfo: { marginLeft: 10, flex: 1 },
  trackName: { fontSize: 16, fontWeight: 'bold' },
  artistName: { fontSize: 14, color: '#777' },
});
