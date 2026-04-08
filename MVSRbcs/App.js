import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import axios from "axios";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState({});
  const [showData, setShowData] = useState(false);

  const BACKEND = "http://10.247.234.4:4000";

  const handleScan = async ({ data }) => {
    if (scanned) return;

    console.log("SCANNED:", data);

    setScanned(true);
    setScanning(false);

    try {
      await axios.post(`${BACKEND}/scan`, { code: data });
    } catch (err) {
      console.log("POST ERROR:", err.message);
    }
  };


  const fetchData = async () => {
    try {
      const res = await axios.get(`${BACKEND}/data`);
      setData(res.data);
      setShowData(true);
    } catch (err) {
      console.log(err);
    }
  };


  if (!permission) return <Text>Requesting permission...</Text>;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }


  // if (scanning) {
  //   return (
  //     <View style={{ flex: 1 }}>
  //       <CameraView
  //         style={{ flex: 1 }}
  //         barcodeScannerSettings={{
  //           barcodeTypes: ["qr", "ean13", "code128"],
  //         }}
  //         onBarcodeScanned={handleScan}
  //       />


  //       <TouchableOpacity
  //         style={styles.backBtn}
  //         onPress={() => {
  //           setScanning(false);
  //           setScanned(false);
  //         }}
  //       >
  //         <Text style={styles.backText}>Back</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  if (scanning) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr",
              "ean13",
              "code128",
              "code39",
            ],
          }}
          onBarcodeScanned={scanned ? undefined : handleScan}
        />

        <View style={styles.overlay}>
          <View style={styles.scanBox} />
        </View>


        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            setScanning(false);
            setScanned(false);
          }}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>


        <Text style={styles.scanText}>
          Align barcode inside the box
        </Text>
      </View>
    );
  }

  //main
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MVSRbcs</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setScanning(true);
          setShowData(false);
        }}
      >
        <Text style={styles.buttonText}>scan barcode</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={fetchData}>
        <Text style={styles.buttonText}>view data</Text>
      </TouchableOpacity>

      {showData && (
        <FlatList
          data={Object.keys(data)}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>Date: {item}</Text>

              {Array.isArray(data[item]?.scanned) ? (
                data[item]?.scanned.map((entry, index) => (
                  <Text key={index}>
                    {entry.scanned} == {entry.time}
                  </Text>
                ))
              ) : (
                <Text>No data</Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    elevation: 3,
  },
  code: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 8,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: "#00FF00",
    borderRadius: 10,
  },

  scanText: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    color: "#fff",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 8,
  },
});