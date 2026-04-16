import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ImageBackground,
  Image,
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";

import API from "./api";

export default function ScannerScreen({ route, navigation }) {
  const colors = {
    background: "#FFFFFF",
    primaryText: "#121212",
    border: "#DDDDDD",
    tableHeaderBackground: "#333333",
    tableRowBackground: "#FFFFFF",
    tableText: "#000000",
    iconButtonBackground: "#FFFFFF",
  };

  const { user } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [currentCode, setCurrentCode] = useState("");
  const [currentCount, setCurrentCount] = useState(0);

  const [data, setData] = useState({});
  const [showData, setShowData] = useState(false);

  const [clk, setClk] = useState(0);


  const handleScan = async ({ data }) => {
    if (scanned) return;

    setScanned(true);

    try {
      await API.post("/scan", {
        code: data,
        username: user.username,
      });

      const res = await API.get("/data");
      const allData = res.data;

      const count = allData.filter(item => item.barcode === data).length;

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
      const res = await API.get("/data");
      setData(res.data);
      if (clk == 0) {
        setShowData(true);
        setClk(1);
      }else if (clk == 1) {
        setShowData(false);
        setClk(0);
      }
      
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
            <Text style={styles.scanAgainText}>Scan</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }


  // const generatePDF = async () => {
  //   try {

  //     const res = await API.get("/generate-pdf");

  //     if (res.data.success) {
  //       const fileUrl = `${BACKEND}/files/report.pdf`;

  //       const fileUri = FileSystem.documentDirectory + "report.pdf";

  //       const download = await FileSystem.downloadAsync(fileUrl, fileUri);

  //       console.log("Saved to:", download.uri);

  //       await Sharing.shareAsync(download.uri);
  //     }
  //   } catch (err) {
  //     console.log("DOWNLOAD ERROR:", err);
  //   }
  // };

  // main
  return (
    <ImageBackground
      source={require("./assets/bcs.png")}
      style={[styles.background, { backgroundColor: colors.background }]}
      resizeMode="contain"
    //resizeMode="stretch"
    >
      <View style={styles.container}>
        <Text style={[styles.username, { color: colors.primaryText }]}>User: {user.username}</Text>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primaryText }]}>MVSR bcs</Text>
        </View>

        {/* DATA SECTION */}
        <View style={styles.dataContainer}>
          {showData && (
            <>
              <View style={[styles.tableHeader, { backgroundColor: colors.tableHeaderBackground }]}>
                <Text style={styles.headerCell}>ID</Text>
                <Text style={styles.headerCell}>Barcode</Text>
                <Text style={styles.headerCell}>Time</Text>
                <Text style={styles.headerCell}>User</Text>
              </View>

              <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={[styles.tableRow, { backgroundColor: colors.tableRowBackground }]}>
                    <Text style={[styles.cell, { color: colors.tableText }]}>{item.id}</Text>
                    <Text style={[styles.cell, { color: colors.tableText }]}>{item.barcode}</Text>
                    <Text style={[styles.cell, { color: colors.tableText }]}>
                      {new Date(item.scan_time).toLocaleString()}
                    </Text>
                    <Text style={[styles.cell, { color: colors.tableText }]}>{item.username}</Text>
                  </View>
                )}
              />
            </>
          )}
        </View>

        {/* {user.username !== "admin" && (
          <View style={styles.gifContainer}>
            <Image
              source={require("./assets/loading.gif")}
              style={styles.gif}
            />
          </View>
        )} */}

        <View style={[styles.bottomButtons, { borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.bcbutton, { backgroundColor: colors.iconButtonBackground }]}
            onPress={() => {
              setScanning(true);
              setClk(0);
              setShowData(false);
            }}
          >
            <Image
              source={require("./assets/barcode.png")}
              style={{ width: 50, height: 50 }}
              resizeMode="contain"
            />
            {/* <Text style={styles.buttonText}>Scan Barcode</Text> */}
          </TouchableOpacity>

          {user.username === "admin" && (
            <>
              <TouchableOpacity style={styles.button} onPress={fetchData}>
                <Text style={styles.buttonText}>View Data</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Counts")}
              >
                <Text style={styles.buttonText}>View Counts</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  background: {
    flex: 1,
    backgroundColor: "white",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#616161",
    padding: 15,
    marginLeft: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  bcbutton: {
    backgroundColor: "#ffffff",
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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

  header: {
    marginTop: 15,
    marginBottom: 15,
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  username: {
    marginTop: 25,
    fontSize: 14,
    fontWeight: "bold",
  },


  dataContainer: {
    flex: 1,
  },

  bottomButtons: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row", 
  justifyContent: "center",
  },



  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
  },

  headerCell: {
    flex: 1,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 3,
    borderRadius: 5,
    elevation: 2,
  },

  cell: {
    flex: 1,
    fontSize: 12,
    color: "#000000",
  },
});