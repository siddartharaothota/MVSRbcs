//siddartharao
import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./LoginScreen";
import ScannerScreen from "./ScannerScreen";
import createUser from "./createUser";
import CountsScreen from "./countScreen";
import ManualEntryScreen from "./enterScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <NavigationContainer theme={DefaultTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#FFFFFF",
            },
            headerTintColor: "#111111",
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Scanner"
            component={ScannerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Register" component={createUser} />

          <Stack.Screen name="Counts" component={CountsScreen} />
          <Stack.Screen name="ManualEntry" component={ManualEntryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}