import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { CameraView, useCameraPermissions } from "expo-camera";
import axios from "axios";

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [currentCode, setCurrentCode] = useState("");
  const [currentCount, setCurrentCount] = useState(0);

  const [data, setData] = useState({});
  const [showData, setShowData] = useState(false);

  const [counts, setCounts] = useState({});
  const [showCounts, setShowCounts] = useState(false);

  const BACKEND = "http://192.168.111.4:4000";

  const handleScan = async ({ data }) => {
    if (scanned) return;

    setScanned(true);

    try {
      await axios.post(`${BACKEND}/scan`, { code: data });

      const res = await axios.get(`${BACKEND}/data`);
      const allData = res.data;

      const count = Array.isArray(allData[data])
        ? allData[data].length
        : 0;

      setCurrentCode(data);
      setCurrentCount(count);

      if (count === 3) {
        Alert.alert("3rd times late", `Barcode: ${data}`);
      }
    } catch (err) {
      console.log("ERROR:", err.message);
    }
  };


  const fetchData = async () => {
    try {
      const res = await axios.get(`${BACKEND}/data`);
      setData(res.data);
      setShowData(true);
      setShowCounts(false);
    } catch (err) {
      console.log(err);
    }
  };


  const fetchCounts = async () => {
    try {
      const res = await axios.get(`${BACKEND}/data`);
      const raw = res.data;

      const result = {};
      Object.keys(raw).forEach((key) => {
        result[key] = Array.isArray(raw[key]) ? raw[key].length : 0;
      });

      setCounts(result);
      setShowCounts(true);
      setShowData(false);
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


  if (scanning) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "code128", "code39"],
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
            setCurrentCode("");
          }}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* <Text style={styles.scanText}>
          Align barcode inside the box
        </Text> */}

        {currentCode !== "" && (
          <View style={styles.resultBox}>
            <Text
              style={[
                styles.resultCode,
                { color: currentCount >= 3 ? "red" : "#00FF00" },
              ]}
            >
              {currentCode}
            </Text>
            <Text style={styles.resultCount}>
              Count: {currentCount}
            </Text>
          </View>
        )}

        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainBtn}
            onPress={() => {
              setScanned(false);
              setCurrentCode("");
            }}
          >
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }




  const generatePDF = async () => {
    try {

      const res = await axios.get(`${BACKEND}/generate-pdf`);

      if (res.data.success) {
        const fileUrl = `${BACKEND}/files/report.pdf`;

        const fileUri = FileSystem.documentDirectory + "report.pdf";

        const download = await FileSystem.downloadAsync(fileUrl, fileUri);

        console.log("Saved to:", download.uri);

        await Sharing.shareAsync(download.uri);
      }
    } catch (err) {
      console.log("DOWNLOAD ERROR:", err);
    }
  };

  // main
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MVSRbcs</Text>

      {/* <TouchableOpacity style={styles.button} onPress={generatePDF}>
  <Text style={styles.buttonText}>Generate PDF</Text>
</TouchableOpacity> */}

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setScanning(true);
          setShowData(false);
          setShowCounts(false);
        }}
      >
        <Text style={styles.buttonText}>Scan Barcode</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={fetchData}>
        <Text style={styles.buttonText}>View Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={fetchCounts}>
        <Text style={styles.buttonText}>View Counts</Text>
      </TouchableOpacity>

      {showData && (
        <FlatList
          data={Object.keys(data)}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const value = data[item];

            return (
              <View style={styles.card}>
                <Text style={styles.code}>{item}</Text>
                {Array.isArray(value) ? (
                  value.map((time, index) => (
                    <Text key={index}>
                      {new Date(time).toLocaleString()}
                    </Text>
                  ))
                ) : (
                  <Text>No valid data</Text>
                )}
              </View>
            );
          }}
        />
      )}

      {showCounts && (
        <FlatList
          data={Object.keys(counts)}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.code}>{item}</Text>
              <Text>Count: {counts[item]}</Text>
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
  },
  overlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  scanBox: {
    width: 300,
    height: 80,
    borderWidth: 2,
    borderColor: "#00FF00",
    borderRadius: 10,
  },
  scanText: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 8,
  },

  resultBox: {
    position: "absolute",
    bottom: 160,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  resultCode: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resultCount: {
    color: "#fff",
    marginTop: 5,
  },

  scanAgainBtn: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
  },
  scanAgainText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 15,
    backgroundColor: "red",
    alignItems: "center",
  },

  closeText: {
    color: "#fff",
    fontWeight: "bold",
  },
});