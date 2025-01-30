import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SearchBar } from 'react-native-elements';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useUser } from "../hooks/useUser";
import { FontAwesome } from '@expo/vector-icons'; // Icon library for button icon


import AsyncStorage from "@react-native-async-storage/async-storage";

const GOOGLE_PLACES_API_KEY = 'AIzaSyBzPFSyyUko1TRyhRb26FyIGt0j5epyDGU';

const Search = () => {
    // Has to be manually updated

  const serverIP = "192.168.0.163"

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [region, setRegion] = useState(null);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

    //database
    const [travelHistory, setTravelHistory] = useState([]); 
    const [recommendation, setRecommendation] = useState([]);
    
    const [userLocation, setUserLocation] = useState(null);

  /*
  Purpose of function: Load database, ask user for permissions, etc
  */
    useEffect(() => {
      const fetchUserDataAndLocation = async () => {
        try {
          const userID = await AsyncStorage.getItem('userID');
          if (!userID) {
            console.warn('No userID found in AsyncStorage.');
            return;
          }
          console.log('UserID from AsyncStorage:', userID);
    
          // 2Request location permissions using native permissions
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Location permission not granted');
            return;
          }
    
          // Get current location using native permissions
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          const { latitude, longitude } = location.coords;
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
          setUserLocation({ latitude, longitude }); // Saves current location to constant variables
          console.log('User Location:', { latitude, longitude });
    
          // Call fetchRecommendations when userID and userLocation are set
          if (userID && latitude && longitude) {
            fetchTravelHistory(userID);
          }
    
        } catch (error) {
          console.error('Error during initialization:', error.message);
        }
      };
    
      fetchUserDataAndLocation();
    }, []);
    
      /*
  Purpose of function: Retrieve infromation from database by connecting to server.js
  */
  const fetchTravelHistory = async (userID) => {
    if (!userID) {
      console.error('UserID is null or undefined.');
      return;
    }
  
    try {
      console.log('User is:', userID); // Debug to ensure userID exists
      const response = await axios.get(`http://${serverIP}:5000/travelHistory`, { params: { userID } });
      console.log('Travel History Data:', response.data);
      setTravelHistory(response.data);
    } catch (error) {
      console.error('Error fetching travel history:', error);
    }
  };
  
  /*
  Purpose of function: Handle any text made to the origin search bar
  */
  const handleOriginChange = (text) => {
    setOrigin(text);
    if (text.length > 2) {
      fetchSuggestions(text, 'origin');
    } else {
      setOriginSuggestions([]);
    }
  };
/*
  Purpose of function: Handle any text made to the destination search bar
  */
  const handleDestinationChange = (text) => {
    setDestination(text);
    if (text.length > 2) {
      fetchSuggestions(text, 'destination');
    } else {
      setDestinationSuggestions([]);
    }
  };

  /*
  Purpose of function: Fetch suggestions to autocomplete address
  */
  const fetchSuggestions = async (input, type) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
        params: {
          input,
          key: GOOGLE_PLACES_API_KEY,
          components: 'country:MY',
        },
      });

      if (type === 'origin') {
        setOriginSuggestions(response.data.predictions);
      } else {
        setDestinationSuggestions(response.data.predictions);
      }
    } catch (error) {
      console.error(error);
      if (type === 'origin') {
        setOriginSuggestions([]);
      } else {
        setDestinationSuggestions([]);
      }
    }
  };
 /*
  Purpose of function: Fetch suggestions to autocomplete address
  */
  const selectSuggestion = async (suggestion, type) => {
    if (type === 'origin') {
      setOrigin(suggestion.description);
      setOriginSuggestions([]);
      const placeDetails = await fetchPlaceDetails(suggestion.place_id);
      if (placeDetails) {
        setOriginCoords({
          latitude: placeDetails.geometry.location.lat,
          longitude: placeDetails.geometry.location.lng,
        });
      }
    } else {
      setDestination(suggestion.description);
      setDestinationSuggestions([]);
      const placeDetails = await fetchPlaceDetails(suggestion.place_id);
      if (placeDetails) {
        setDestinationCoords({
          latitude: placeDetails.geometry.location.lat,
          longitude: placeDetails.geometry.location.lng,
        });
      }
    }
  };
 /*
  Purpose of function: Fetch suggestions to autocomplete address
  */
  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
        params: {
          place_id: placeId,
          key: GOOGLE_PLACES_API_KEY,
        },
      });
      return response.data.result;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
 /*
  Purpose of function: For routing between pages
  */
  const router = useRouter();

   /*
  Purpose of function: Handle search logic
  */
  const handleSearchButtonPress = () => {
    if (!origin || !destination) {
      Alert.alert('Warning', 'Please enter both origin and destination.');
    } else {
      router.push({
        pathname: 'track',
        params: { origin, destination },
      });
    }
  };




  return (

<View style={styles.container}>
      {/* Map Section (25% of screen) */}
      <View style={styles.mapContainer}>
      {region ? (
        <MapView style={styles.map} initialRegion={region}>
          {originCoords && (
            <Marker
              coordinate={originCoords}
              title="Origin"
              description={origin}
              pinColor="red"
            />
          )}
          {destinationCoords && (
            <Marker
              coordinate={destinationCoords}
              title="Destination"
              description={destination}
              pinColor="blue"
            />
          )}
          {originCoords && destinationCoords && (
            <Polyline
              coordinates={[originCoords, destinationCoords]}
              strokeColor="red"
              strokeWidth={4}
            />
          )}
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      )}


    </View>

      {/* Search Section (stacked vertically) */}
<View style={styles.searchBarContainer}>
  <SearchBar
    style={styles.input}
    placeholder="Origin"
    value={origin}
    onChangeText={handleOriginChange}
  />
  <FlatList
    data={originSuggestions}
    keyExtractor={(item) => item.place_id}
    renderItem={({ item }) => (
      <TouchableOpacity onPress={() => selectSuggestion(item, 'origin')}>
        <Text style={styles.suggestion}>{item.description}</Text>
      </TouchableOpacity>
    )}
  />
</View>

<View style={styles.searchBarContainer}>
  <SearchBar
    style={styles.input}
    placeholder="Destination"
    value={destination}
    onChangeText={handleDestinationChange}
  />
  <FlatList
    data={destinationSuggestions}
    keyExtractor={(item) => item.place_id}
    renderItem={({ item }) => (
      <TouchableOpacity onPress={() => selectSuggestion(item, 'destination')}>
        <Text style={styles.suggestion}>{item.description}</Text>
      </TouchableOpacity>
    )}
  />
          <Button title="Search" onPress={handleSearchButtonPress} />

</View>

      {/* History and Recommendation Tables */}
      <ScrollView style={styles.tableContainer}>
  <View style={styles.tableWrapper}>
    <Text style={styles.tableTitle}>History</Text>

    {travelHistory.length > 0 ? (
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerText]}>Date</Text>
          <Text style={[styles.tableCell, styles.headerText]}>Start</Text>
          <Text style={[styles.tableCell, styles.headerText]}>End</Text>
        </View>

        {/* Table Rows */}
        {travelHistory.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.traveldate}</Text>
            <Text style={styles.tableCell}>{item.startlocation}</Text>
            <Text style={styles.tableCell}>{item.endlocation}</Text>
          </View>
        ))}
      </View>
    ) : (
      <Text>No History Available</Text>
    )}
  </View>
</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    
  },
  mapContainer: {
    height: '40%',
    width: '100%',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  fullscreenMapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 999, // This ensures the fullscreen map sits above everything else
  },
  fullscreenMap: {
    ...StyleSheet.absoluteFillObject,
  },
  expandButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  compressButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#007bff',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchBarContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  searchBarContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 0,
  },
  searchButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#6200ee',
    color: 'white',
    textAlign: 'center',
  },
  table: {
    borderColor: '#ddd',
    borderWidth: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6200ee',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    color: '#333',
  },
  headerText: {
    fontWeight: 'bold',
    color: 'white',
  
  },
});

export default Search;