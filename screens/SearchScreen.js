import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('song');
  const [loading, setLoading] = useState(false);

  const searchItunes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=${searchType}&limit=25`);
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 iTunes Seeker</Text>

      <View style={styles.filterButtonsContainer}>
        <Pressable
          style={[styles.filterButton, searchType === 'song' && styles.activeFilter]}
          onPress={() => {
            setSearchType('song');
            if (query.trim() !== '') searchItunes();
          }}
        >
          <Text style={[styles.filterText, searchType === 'song' && styles.activeFilterText]}>Singles</Text>
        </Pressable>
        
        <Pressable
          style={[styles.filterButton, searchType === 'album' && styles.activeFilter]}
          onPress={() => {
            setSearchType('album');
            if (query.trim() !== '') searchItunes();
          }}
        >
          <Text style={[styles.filterText, searchType === 'album' && styles.activeFilterText]}>Albums</Text>
        </Pressable>
        
        <Pressable
          style={[styles.filterButton, searchType === 'musicArtist' && styles.activeFilter]}
          onPress={() => {
            setSearchType('musicArtist');
            if (query.trim() !== '') searchItunes();
          }}
        >
          <Text style={[styles.filterText, searchType === 'musicArtist' && styles.activeFilterText]}>Artistes</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Rechercher un son, album ou artiste"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <Pressable onPress={searchItunes} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.collectionButton}
        onPress={() => navigation.navigate('My Collection')}
      >
        <Text style={styles.collectionButtonText}>Voir ma Playlist</Text>
      </Pressable>

      {loading && <ActivityIndicator size="large" color="#222" style={{ marginVertical: 20 }} />}

      <FlatList
        data={results}
        keyExtractor={(item, index) => item.trackId?.toString() || item.collectionId?.toString() || item.artistId?.toString() || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Details', { item, itemType: searchType })}
            style={styles.card}
          >
            <Image
              source={{ uri: item.artworkUrl100 || 'https://via.placeholder.com/100x100.png?text=No+Image' }}
              style={styles.cover}
            />
            <View style={styles.info}>
              <Text style={styles.trackName}>
                {searchType === 'album' ? item.collectionName : searchType === 'musicArtist' ? item.artistName : item.trackName}
              </Text>
              <Text style={styles.artistName}>
                {item.artistName}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40, backgroundColor: '#f9f9f9' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#222' },
  filterButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  filterButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#e0e0e0' },
  filterText: { color: '#333', fontWeight: 'bold' },
  activeFilter: { backgroundColor: '#222' },
  activeFilterText: { color: '#fff' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eaeaea', borderRadius: 12, paddingHorizontal: 10, marginBottom: 20 },
  input: { flex: 1, height: 45, fontSize: 16, color: '#222' },
  searchButton: { backgroundColor: '#222', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10 },
  searchButtonText: { color: '#fff', fontWeight: 'bold' },
  collectionButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  collectionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginBottom: 12, padding: 12, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  cover: { width: 60, height: 60, borderRadius: 8 },
  info: { marginLeft: 12, flex: 1 },
  trackName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  artistName: { fontSize: 14, color: '#555', marginTop: 4 },
});
