import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import ModalSelector from 'react-native-modal-selector';
import { organizeRoutes } from './script';
import FontAwesome from '@expo/vector-icons/FontAwesome';


const GOOGLE_PLACES_API_KEY = 'AIzaSyBzPFSyyUko1TRyhRb26FyIGt0j5epyDGU'; 
const GOOGLE_DIRECTIONS_API_URL = 'https://maps.googleapis.com/maps/api/directions/json';

const Track = () => {
  const { origin, destination } = useLocalSearchParams();
  const router = useRouter();
  const [routes, setRoutes] = useState([]);
  const [filter, setFilter] = useState({
    walking: true,
    bus: true,
    tram: true,
    subway: true,
    departureTime: new Date(),
    routeType: 'fastest',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeOption, setTimeOption] = useState('Depart now'); // Track time option (Depart now / Set time)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);

  /*
  Fetch routes from the script.tsx
  */
  useEffect(() => {
    fetchRoutes();
  }, [filter]);

  /*
  Fetch routes based on filter options and selected date/time
  */
  const fetchRoutes = async () => {
    try {
      const { walking, bus, tram, subway, departureTime, routeType } = filter;
      const modes = [bus ? 'bus' : null, tram ? 'tram' : null, subway ? 'subway' : null]
        .filter(Boolean)
        .join('|');
  
      const params = {
        origin,
        destination,
        departure_time: Math.floor(departureTime.getTime() / 1000),
        mode: 'transit',
        transit_mode: modes,
        key: GOOGLE_PLACES_API_KEY,
      };
  
      // Add condition for fewest transfers
      if (routeType === 'fewest_transfers') {
        //Prioritize less walking
        params.transit_routing_preference = 'less_walking'; 
      }
  
      const response = await axios.get(GOOGLE_DIRECTIONS_API_URL, { params });
  
      if (response.data.routes && response.data.routes.length > 0) {
        setRoutes(response.data.routes.slice(0, 5)); // Display up to 5 routes
      } else {
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };
  

  // Handle route click and navigate to the details page
  const handleRouteClick = (route) => {
    router.push({
      pathname: '/detailedRoute', 
      // Passing the route data as a string
      params: {
        route: JSON.stringify(route), 
        origin: origin,
        destination: destination,
      },
    });
  };
  // Handle date and time picker change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'set') {
      const currentDate = selectedDate || filter.departureTime;
      if (currentDate >= new Date()) {
        setFilter({ ...filter, departureTime: currentDate });
      } else {
        Alert.alert('Invalid Time', 'Please select a future time.');
      }
    }
  };

  const handleSetDepartureTime = () => {
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(selectedHour);
    selectedDateTime.setMinutes(selectedMinute);

    if (selectedDateTime > new Date()) {
      setFilter({ ...filter, departureTime: selectedDateTime });
      alert(`Departure time set to ${selectedDateTime.toLocaleString()}`);
    } else {
      alert('Please select a future time.');
    }
  };

  const handleDepartNow = () => {
    setFilter({ ...filter, departureTime: new Date() });
    alert('Departure time set to now!');
  };

  // Generate hour options
  const getFutureHourOptions = (isToday) => {
    const options = [];
    const currentHour = new Date().getHours();
    const endHour = isToday ? 23 : 24;
    for (let i = isToday ? currentHour : 0; i < endHour; i++) {
      options.push({ key: i, label: i.toString().padStart(2, '0') });
    }
    return options;
  };

  // Generate minute options
  const getFutureMinuteOptions = (isToday) => {
    const options = [];
    const currentMinute = new Date().getMinutes();
    const endMinute = isToday && currentMinute <= 45 ? currentMinute + 15 : 60;
    for (let j = currentMinute <= 45 ? currentMinute + 15 : 0; j < endMinute; j += 15) {
      options.push({ key: j, label: j.toString().padStart(2, '0') });
    }
    return options;
  };

  // Check if selected date is today
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Machine Learning Script

  const fetchAndOrganizeRoutes = async () => {
    try {
      const fetchedRoutes = await fetchRoutes();
      const organizedRoutes = await organizeRoutes(fetchedRoutes, filter);
      setRoutes(organizedRoutes.slice(0, 5)); // Update UI with sorted routes
    } catch (error) {
    }
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    const firstLine = address.split('\n')[0]; // Get first line of the address
    const commaIndex = firstLine.indexOf(','); // Find first occurrence of comma
    if (commaIndex !== -1) {
      return firstLine.substring(0, commaIndex); // Truncate at the comma
    } else if (firstLine.length > 20) {
      return firstLine.substring(0, 20) + '...'; // Fallback to truncating first line
    }
    return firstLine;
  };

  const shortOrigin = shortenAddress(origin);
  const shortDestination = shortenAddress(destination);

  useEffect(() => {
    fetchAndOrganizeRoutes();
  }, [filter]);


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Transit Options from 
        <Text style={styles.highlight}> {shortOrigin} </Text>
        <FontAwesome name="arrow-right" size={18} color="black" />
        <Text style={styles.highlight}> {shortDestination} </Text>
      </Text>

      {/* Time Option Dropdown */}
      <Text style={styles.info}>Select Departure Option:</Text>
      <ModalSelector
        data={[
          { key: 'Depart now', label: 'Depart Now' },
          { key: 'Set departure time', label: 'Set Departure Time' },
        ]}
        initValue={timeOption}
        onChange={(option) => {
          setTimeOption(option.key);
          if (option.key === 'Depart now') {
            handleDepartNow();
          }
        }}
      />

      {/* Depart Now Button */}
      {timeOption === 'Depart now' && (
        <Button title="Depart Now" onPress={handleDepartNow} />
      )}

      {/* Set Departure Time */}
      {timeOption === 'Set departure time' && (
        <>
          <Text style={styles.info}>Set Departure Date and Time:</Text>

          {/* Date Picker */}
          <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.datePickerText}>{selectedDate.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              minDate={new Date()} // Only allow today or future dates
              onChange={(event, date) => {
                setShowDatePicker(false);
                setSelectedDate(date || selectedDate);
              }}
            />
          )}

          {/* Hour Picker */}
          <ModalSelector
            data={getFutureHourOptions(isToday)}
            initValue="Select Hour"
            value={selectedHour}
            onChange={(option) => setSelectedHour(option.key)}
          />

          {/* Minute Picker */}
          <ModalSelector
            data={getFutureMinuteOptions(isToday)}
            initValue="Select Minute"
            value={selectedMinute}

            onChange={(option) => setSelectedMinute(option.key)}
          />

          {/* Confirm Time Button */}
          <TouchableOpacity style={styles.confirmButton} onPress={handleSetDepartureTime}>
            <Text style={styles.confirmButtonText}>Confirm Departure Time</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Route Type Picker */}
      <Picker
        selectedValue={filter.routeType}
        onValueChange={(value) => setFilter({ ...filter, routeType: value })}
      >
        <Picker.Item label="Fastest Route" value="fastest" />
        <Picker.Item label="Fewest Transfers" value="fewest_transfers" />
      </Picker>

      {/* Display available routes */}
      {routes.length > 0 ? (
        routes.map((route, index) => (
          <TouchableOpacity
            key={index}
            style={styles.trip}
            onPress={() => handleRouteClick(route)}
          >
            <Text style={styles.routeTitle}>Route {index + 1}</Text>
            <Text>Estimated Duration: {route.legs[0].duration.text}</Text>
            <Text>Transfers: {route.legs[0].steps.filter(step => step.travel_mode === 'TRANSIT').length - 1}</Text>
            <Text>
              Modes: {route.legs[0].steps.map(step => step.travel_mode).join(', ')}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text>No routes available</Text>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    marginVertical: 8,
  },
  confirmButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  datePickerButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 8,
  },
  datePickerText: {
    fontSize: 16,
    textAlign: 'center',
  },
  trip: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 8,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#007BFF', // Change to any color you prefer
  },
});

export default Track;
