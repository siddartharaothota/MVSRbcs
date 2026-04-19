import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import API from "./api";

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export default function CountsScreen() {
  const colors = {
    background: "#f5f5f5",
    text: "#111111",
    headerBackground: "#333333",
    headerText: "#FFFFFF",
    rowBackground: "#FFFFFF",
    rowText: "#1A1A1A",
  };

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await API.get("/counts");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const generatePDF = async () => {
  try {
    const fileUri = FileSystem.documentDirectory + "report.pdf";

    const download = await FileSystem.downloadAsync(
      `${API.defaults.baseURL}/generate-pdf`,
      fileUri
    );

    console.log("Saved:", download.uri);

    await Sharing.shareAsync(download.uri);
  } catch (err) {
    console.log("ERROR:", err);
  }
};

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Students count data</Text>

      {/* Table Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <Text style={[styles.headerText, { color: colors.headerText }]}>Barcode</Text>
        <Text style={[styles.headerText, { color: colors.headerText }]}>Count</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors.rowBackground }]}>
            <Text style={[styles.cell, { color: colors.rowText }]}>{item.barcode}</Text>
            <Text style={[styles.cell, { color: colors.rowText }]}>{item.count}</Text>
          </View>
        )}
      />


      <TouchableOpacity style={styles.button} onPress={generatePDF}>
        <Text style={styles.buttonText}>Generate PDF</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 5,
  },

  headerText: {
    flex: 1,
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    padding: 12,
    marginVertical: 4,
    borderRadius: 5,
    elevation: 2,
  },

  cell: {
    flex: 1,
  },

  button: {
    backgroundColor: "#616161",
    padding: 15,
    marginLeft: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});