import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../hooks/useUser";
import Constants from 'expo-constants';

import { MaterialIcons } from '@expo/vector-icons';

const Login = () => {
  //constant to store the user details
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setUserID } = useUser(); 

  // Has to be manually updated
  const serverIP = "192.168.0.163"
  const serverURL = `http://${serverIP}:5000/login`;

  /*
  Purpose of function: Retrieve information typed to the document and save to the database 
  by connecting to the server
  */
  const handleLogin = async () => {
    try {
      const response = await fetch(serverURL , {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save the user ID to AsyncStorage and context
        await AsyncStorage.setItem("userID", data.userID.toString());
        setUserID(data.userID); // Save userID to context
        console.log("Login successful! UserID saved:", data.userID);
        Alert.alert(
          "Successfull Login",
        );
        router.push("/search"); // Navigate to the search page
      } else {
        Alert.alert("Login Failed", data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert(
        "Error",
        "Unable to connect to the server. Please try again later."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>MyOptiRoute</Text>
      <Text style={styles.subTitle}>Travel anywhere, your way - with our smart app. </Text>

      
    <Image 
            source={require('../../assets/images/train.jpg')} 
            style={styles.icon} 
          />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Sign Up"
        onPress={() => router.push("/register")}
        color="gray"
      />
    </View>
  );
};

/*
Purpose to set the css styles for this document 
*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: '#b0afff', 

  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
    color: "gold",
  },
  subTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    color: "black",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  icon: {
    alignSelf: 'center', 
    width: 200, 
    height: 150, 

  },
});

export default Login;
