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

export default function LoginScreen({ navigation }) {
  const colors = {
    background: "#f5f5f5",
    text: "#111111",
    inputBackground: "#FFFFFF",
    placeholder: "#6B6B6B",
    secondaryText: "#333333",
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/login", {
        username,
        password,
      });

      if (res.data.success) {
        setError("");
        const user = res.data.user;

        navigation.replace("Scanner", { user });
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Server error. Try again.");
      console.log(err.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Login</Text>

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

      {error !== "" && (
        <Text style={{ color: "red", marginBottom: 18, marginLeft: 5 }}>
          {error}
        </Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>



      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={{ textAlign: "center", marginTop: 10, color: colors.secondaryText }}>
          Create new account
        </Text>
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
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
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