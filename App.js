import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  DrawerLayoutAndroid,
  TouchableOpacity,
} from "react-native";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import HomeScreen from "./screens/HomeScreen";
import DetailScreen from "./screens/DetailScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";

import CustomDrawer from "./components/CustomDrawer";

export default function App() {

  const drawer = useRef(null);

  const [screen, setScreen] = useState("Inicio");

  const renderScreen = () => {

    switch (screen) {

      case "Inicio":
        return <HomeScreen setScreen={setScreen} />;

      case "Detalles":
        return <DetailScreen setScreen={setScreen} />;

      case "Perfil":
        return <ProfileScreen />;

      case "Configuración":
        return <SettingsScreen />;

      default:
        return <HomeScreen setScreen={setScreen} />;

    }

  };

  return (

    <SafeAreaProvider>

      <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={280}
        renderNavigationView={() => (

          <CustomDrawer
            setScreen={setScreen}
            currentScreen={screen}
            closeDrawer={() => drawer.current.closeDrawer()}
          />

        )}
      >

        <SafeAreaView style={{ flex: 1 }}>

          {/* HEADER */}
          <View style={styles.header}>

            <TouchableOpacity
              onPress={() => drawer.current.openDrawer()}
            >
              <Text style={styles.menu}>
                ☰
              </Text>
            </TouchableOpacity>

            <Text style={styles.title}>
              {screen}
            </Text>

          </View>

          {/* SCREEN */}
          {renderScreen()}

        </SafeAreaView>

      </DrawerLayoutAndroid>

    </SafeAreaProvider>

  );

}

const styles = StyleSheet.create({

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1565C0",
    padding: 15,
    elevation: 5
  },

  menu: {
    fontSize: 28,
    color: "white",
  },

  title: {
    color: "white",
    fontSize: 22,
    marginLeft: 20,
    fontWeight: "bold",
  },

});