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

export default function ManualEntryScreen({ route }) {
  const { user } = route.params;

  const [code, setCode] = useState("2451-");

  const handleSubmit = async () => {
    const pattern = /^\d{4}-\d{2}-\d{3}-\d{3}$/;

    if (!pattern.test(code)) {
      Alert.alert("Invalid Format", "Check the format and try again.");
      return;
    }

    try {
      await API.post("/scan", {
        code: code,
        username: user.username,
      });

      Alert.alert("Success", "Data added");

      setCode("2451-"); // clear input
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manual Entry</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter barcode (2451-xx-xxx-xxx)"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#616161",
    padding: 15,
    borderRadius: 10,
    marginBottom: 140,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});