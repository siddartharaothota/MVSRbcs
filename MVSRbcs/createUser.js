import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import API from "./api";

export default function RegisterScreen({ navigation }) {
  const colors = {
    background: "#f5f5f5",
    text: "#111111",
    inputBackground: "#FFFFFF",
    placeholder: "#6B6B6B",
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Enter all fields");
      return;
    }

    try {
      const res = await API.post("/register", {
        username,
        password,
      });

      if (res.data.success) {
        Alert.alert("Success", "User created");
        navigation.goBack(); // go back to login
      } else {
        Alert.alert("Error", res.data.message);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Server error");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>

      <TextInput
        placeholder="Username"
        placeholderTextColor={colors.placeholder}
        style={[
          styles.input,
          { backgroundColor: colors.inputBackground, color: colors.text },
        ]}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={colors.placeholder}
        style={[
          styles.input,
          { backgroundColor: colors.inputBackground, color: colors.text },
        ]}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});