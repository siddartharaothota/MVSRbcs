import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import API from "./api";

export default function CountsScreen() {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students count data</Text>

      {/* Table Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Barcode</Text>
        <Text style={styles.headerText}>Count</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.barcode}</Text>
            <Text style={styles.cell}>{item.count}</Text>
          </View>
        )}
      />
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
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
  },

  headerText: {
    flex: 1,
    color: "#fff",
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 4,
    borderRadius: 5,
    elevation: 2,
  },

  cell: {
    flex: 1,
  },
});