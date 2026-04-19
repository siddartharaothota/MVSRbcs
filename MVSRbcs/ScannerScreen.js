import React, { useEffect, useRef, useState } from "react";
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
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

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
  const playerRef = useRef(null);

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        });

        const player = createAudioPlayer(require("./assets/beep.mp3"));
        player.loop = false;
        playerRef.current = player;
      } catch (err) {
        console.log("Audio mode error:", err.message);
      }
    };

    configureAudio();

    return () => {
      if (playerRef.current) {
        playerRef.current.remove();
      }
    };
  }, []);

  const playBeep = async () => {
    if (!playerRef.current) {
      return;
    }

    try {
      await playerRef.current.seekTo(0);
      playerRef.current.play();
    } catch (err) {
      console.log("Sound error:", err.message);
    }
  };

  let timer;
  const handleScan = async ({ data }) => {
    if (scanned) return;

    setScanned(true);

    const pattern = /^\d{4}-\d{2}-\d{3}-\d{3}$/;

    if (!pattern.test(data)) {
      setScanning(false);
      setScanned(false);
      Alert.alert("Invalid Barcode", "Something went wrong. try again.");
      return;
    }

    playBeep();

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

      setScanning(false);//to go back

      if (timer) clearTimeout(timer);

      timer = setTimeout(() => {
        setCurrentCode("");
        setCurrentCount(0);
      }, 3000);

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
      } else if (clk == 1) {
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

        <Text style={styles.permission}>Need permission to use camera for barcode scanning.</Text>
        <Text style={{ color: "#000000", marginBottom: 20 }}>
          Click on <Text style={{ color: "#000000", fontWeight: "bold" }}>'Allow Camera'</Text> to grant permission.
        </Text>
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

        {/*the rollno and count*/}
        {/* {currentCode !== "" && (
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
        )} */}

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



  // main
  return (
    <ImageBackground
      source={require("./assets/bcs.png")}
      style={[styles.background, { backgroundColor: colors.background }]}
      resizeMode="contain"
    //resizeMode="stretch"
    >
      <View style={styles.container}>
        <View style={styles.topRow}>

          <Text style={styles.title}>
            MVSR bcs
          </Text>

          <Text style={styles.username}>
            User: {user.username}
          </Text>

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

        {currentCode !== "" && (
          <View style={styles.lastScannedBox}>
            <Text style={styles.lastScannedTitle}>Scanned</Text>

            <Text style={styles.lastScannedCode}>
              {currentCode}
            </Text>

            <Text style={styles.lastScannedCount}>
              Count: {currentCount}
            </Text>
          </View>
        )}

        <View style={[styles.bottomButtons, { borderColor: colors.border }]}>

          <View style={styles.groupContainer}>


            {user.username === "Vaishu" && (
              <>
                <TouchableOpacity
                  style={styles.groupButton}
                  onPress={() => navigation.navigate("ManualEntry", { user })}
                >
                  <Text style={styles.groupText}>Manual Entry</Text>
                </TouchableOpacity>
              </>
            )}


            <TouchableOpacity
              style={styles.groupButton}
              onPress={() => {
                setScanning(true);
                setClk(0);
                setShowData(false);
                setScanned(false);
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
                <TouchableOpacity style={styles.groupButton} onPress={fetchData}>
                  <Text style={styles.groupText}>View Data</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.groupButton}
                  onPress={() => navigation.navigate("Counts")}
                >
                  <Text style={styles.groupText}>View Counts</Text>
                </TouchableOpacity>
              </>
            )}

          </View>

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

  permission: {
    color: "#000000",
    fontSize: 16,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 25,
    fontWeight: "bold",
  },

  overlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  scanBox: {
    width: 270,
    height: 270,
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
    marginTop: 5,
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

  topRow: {
    flexDirection: "column",
    alignItems: "left",
    marginTop: 25,
  },

  manualBtn: {
    backgroundColor: "#006a9f",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  cell: {
    flex: 1,
    fontSize: 12,
    color: "#000000",
  },

  lastScannedBox: {
    backgroundColor: "#000000cc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  lastScannedTitle: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 4,
  },

  lastScannedCode: {
    color: "#00FF00",
    fontSize: 16,
    fontWeight: "bold",
  },

  lastScannedCount: {
    color: "#fff",
    marginTop: 4,
  },

  groupContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#616161",
    borderRadius: 10,
    overflow: "hidden", // important (cuts inner borders cleanly)
  },

  groupButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderColor: "#616161",
  },

  lastButton: {
    borderRightWidth: 0, // remove last divider
  },

  groupText: {
    color: "#000000",
    fontWeight: "bold",
  },
});