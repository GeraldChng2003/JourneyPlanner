import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Has to be manually updated
  const serverIP = "192.168.0.163"
  const serverURL = `http://${serverIP}:5000/register`;

  /*
  Purpose of function: Retrieve information typed to the document and save to the database 
  by connecting to the server
  */
  const handleRegister = async () => {
    try {
      const response = await axios.post(serverURL, {
        name,
        email,
        password,
      });
      Alert.alert("Success", response.data.message);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registeriation</Text>
      <View style={styles.line} />

      <Text style={styles.subHeading}>Account Creation</Text>
      <Text>It looks like you don't have an account. Lets make one together</Text>


      <Text style={styles.subHeading}>Nickname: </Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.subHeading}>Email: </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
            <Text style={styles.subHeading}>Password: </Text>

      <TextInput
        style={styles.input}
        placeholder="Password"  
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register Account" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: '#b0afff', // Light blue color

  },
  title: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  subHeading: {
    fontSize: 20,
    margin: 15,
    color: "black",
    fontWeight: "bold",

  },
  line: {
    height: 1, // Line height
    width: '100%', // Full width
    backgroundColor: '#000', // Line color (black)
  },
});

export default Register;
