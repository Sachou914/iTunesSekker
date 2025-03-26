import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SearchScreen from './screens/SearchScreen';
import DetailsScreen from './screens/DetailsScreen';
import MyCollectionScreen from './screens/MyCollectionScreen';
import CollectionDetailsScreen from './screens/CollectionDetailsScreen';
import AlbumOrArtistDetailsScreen from './screens/AlbumOrArtistDetailsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="My Collection" component={MyCollectionScreen} />
        <Stack.Screen name="CollectionDetails" component={CollectionDetailsScreen} />
        <Stack.Screen name="AlbumOrArtistDetails" component={AlbumOrArtistDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
