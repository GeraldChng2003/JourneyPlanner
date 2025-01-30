import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Button, Linking } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import polyline from '@mapbox/polyline';

const detailedRoute = () => {
  const { route, origin, destination } = useLocalSearchParams();
  const [routeDetails, setRouteDetails] = useState(null);
  const [decodedPolyline, setDecodedPolyline] = useState([]);

  // Parse the route JSON data
  useEffect(() => {
    if (route && typeof route === 'string') {
      try {
        const details = JSON.parse(route);
        setRouteDetails(details);

        // Decode the overview_polyline
        const encodedPolyline = details?.overview_polyline?.points;
        if (encodedPolyline) {
          const coordinates = polyline.decode(encodedPolyline).map(([lat, lng]) => ({
            latitude: lat,
            longitude: lng,
          }));
          setDecodedPolyline(coordinates);
        }
      } catch (error) {
        console.error('Error parsing route data:', error);
      }
    }
  }, [route]);

  // Check if routeDetails has valid data
  if (!routeDetails || !routeDetails.legs || routeDetails.legs.length === 0) {
    return <Text>No route details available</Text>;
  }

  const leg = routeDetails.legs[0]; // Using the first leg of the journey

  // Function to open Google Maps
  const openInGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&travelmode=transit`;

    Linking.openURL(googleMapsUrl).catch((err) => {
      console.error("Couldn't open Google Maps", err);
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: leg.start_location.lat,
            longitude: leg.start_location.lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Render the smooth polyline */}
          <Polyline
            coordinates={decodedPolyline}
            strokeColor="#0000FF" // Set a default color (e.g., blue)
            strokeWidth={4}
          />

          {/* Add Markers for Start and End Points */}
          <Marker
            coordinate={{
              latitude: leg.start_location.lat,
              longitude: leg.start_location.lng,
            }}
            pinColor="green" 
            title="Start Point"
            description={leg.start_address}
          />
          <Marker
            coordinate={{
              latitude: leg.end_location.lat,
              longitude: leg.end_location.lng,
            }}
            pinColor="red" 
            title="End Point"
            description={leg.end_address}
          />
        </MapView>
      </View>

      {/* Route Details Section */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>Route Details</Text>
        <Text style={styles.info}>From: {origin}</Text>
        <Text style={styles.info}>To: {destination}</Text>
        <Text style={styles.info}>Estimated Duration: {leg.duration.text}</Text>
        <Text style={styles.info}>Total Distance: {leg.distance.text}</Text>
        <Text style={styles.info}>Transfers: {leg.steps.length - 1}</Text>
        <Text style={styles.info}>Start Address: {leg.start_address}</Text>
        <Text style={styles.info}>End Address: {leg.end_address}</Text>

        {/* Steps Section */}
        <Text style={styles.subtitle}>Steps:</Text>
        {leg.steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <Text style={styles.stepText}>
              {index + 1}. {step.html_instructions.replace(/<[^>]*>/g, '')}
            </Text>
            <Text style={styles.stepInfo}>Mode: {step.travel_mode}</Text>
            {step.transit_details?.line?.name && (
              <Text style={styles.stepInfo}>Line: {step.transit_details.line.name}</Text>
            )}
            <Text style={styles.stepInfo}>Distance: {step.distance.text}</Text>
            <Text style={styles.stepInfo}>Duration: {step.duration.text}</Text>
          </View>
        ))}

        {/* Button to Open in Google Maps */}
        <View style={styles.buttonContainer}>
          <Button title="Open in Google Maps" onPress={openInGoogleMaps} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mapContainer: {
    height: Dimensions.get('window').height * 0.4, // 40% of screen height
  },
  map: {
    flex: 1,
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: -10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  info: {
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  stepContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepInfo: {
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    marginTop: 16,
  },
});

export default detailedRoute;
