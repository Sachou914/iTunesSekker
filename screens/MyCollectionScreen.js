import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyCollectionScreen({ navigation }) {
  const [collection, setCollection] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchCollection = async () => {
        const data = await AsyncStorage.getItem('myCollection');
        if (data) {
          setCollection(JSON.parse(data));
        } else {
          setCollection([]);
        }
      };
      fetchCollection();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎶 Ma Playlist</Text>
      {collection.length === 0 ? (
        <Text style={styles.empty}>Votre Playlist est vide.</Text>
      ) : (
        <FlatList
          data={collection}
          keyExtractor={(item, index) => item.trackId ? item.trackId.toString() : index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('CollectionDetails', { item })}
            >
              <Image 
                source={{ uri: item.artworkUrl100 || 'https://via.placeholder.com/100x100.png?text=No+Image' }} 
                style={styles.cover} 
              />
              <View style={styles.info}>
                <Text style={styles.trackName}>{item.trackName}</Text>
                <Text style={styles.artistName}>{item.artistName}</Text>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  empty: { textAlign: 'center', color: '#777', marginTop: 50 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cover: { width: 60, height: 60, borderRadius: 8 },
  info: { marginLeft: 12, flex: 1 },
  trackName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  artistName: { fontSize: 14, color: '#555', marginTop: 4 },
});
