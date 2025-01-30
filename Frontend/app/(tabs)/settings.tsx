import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function Settings() {
  // Has to be manually updated
  const serverIP = "192.168.0.163"

  // State to manage preferences for multiple toggles
  const [preferences, setPreferences] = useState({
    restaurants: false,
    touristAttractions: false,
    malls: false,
    hotels: false,
    schools: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);
  
  const loadPreferences = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      if (!userID) {
        Alert.alert('Error', 'UserID not found. Please login again.');
        return;
      }
      const response = await axios.get(`http://${serverIP}:5000/preferences`, { params: { userID } });
      const updatedPreferences = {
        restaurants: response.data.restaurants ?? false,
        attractions: response.data.attractions ?? false,
        malls: response.data.malls ?? false,
        hotels: response.data.hotels ?? false,
        schools: response.data.schools ?? false,
      };
      setPreferences(updatedPreferences);
    } catch (error) {
      Alert.alert('Error', 'Failed to load preferences. Please try again.');
    }
  };
  
  const togglePreference = async (preferenceField) => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      if (!userID) {
        Alert.alert('Error', 'UserID not found.');
        return;
      }
  
      const response = await axios.post(`http://${serverIP}:5000/preferences`, 
        { preferenceField }, 
        { params: { userID } }
      );
  
      const updatedPreferences = {
        restaurants: response.data.preferences.restaurants ?? false,
        attractions: response.data.preferences.attractions ?? false,
        malls: response.data.preferences.malls ?? false,
        hotels: response.data.preferences.hotels ?? false,
        schools: response.data.preferences.schools ?? false,
      };
      setPreferences(updatedPreferences);
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle preference.');
    }
  };
  

  return (
    <View style={styles.container}>
    <Text style={styles.title}>Settings</Text>
    {Object.keys(preferences).map((key) => (
      <View style={styles.switchContainer} key={key}>
        <Text style={styles.label}>{key}</Text>
        <Switch
          onValueChange={() => togglePreference(key)} // Pass the field name
          value={preferences[key]}
        />
      </View>
    ))}
  </View>
  );
};

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).replace(/([A-Z])/g, ' $1');
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 18,
  },
});
