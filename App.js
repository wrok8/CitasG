import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  DrawerLayoutAndroid,
  TouchableOpacity,
  Alert,
} from "react-native";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import HomeScreen from "./screens/HomeScreen";
import DetailScreen from "./screens/DetailScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";
import RegisterPatientScreen from "./screens/RegisterPatientScreen";
import ResumenScreen from "./screens/ResumenScreen";
import ListaPacientesScreen from "./screens/ListaPacientesScreen";
import EvaluacionesScreen from "./screens/EvaluacionesScreen";
import EntornoMenuScreen from "./screens/EntornoMenuScreen";
import OARSScreen from "./screens/OARSScreen";

import CognitivoMenuScreen from "./screens/CognitivoMenuScreen";
import AfectivoMenuScreen from "./screens/AfectivoMenuScreen";
import FuncionamientoMenuScreen from "./screens/FuncionamientoMenuScreen";
import NutricionalMenuScreen from "./screens/NutricionalMenuScreen";

import CustomDrawer from "./components/CustomDrawer";

export default function App() {
  const drawer = useRef(null);
  const [screen, setScreen] = useState("Inicio");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActual, setPacienteActual] = useState(null);

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

      case "Agendar Cita":
        return (
          <RegisterPatientScreen
            setScreen={setScreen}
            setPacienteActual={setPacienteActual}
            pacienteActual={pacienteActual}
          />
        );

      case "Resumen":
        return (
          <ResumenScreen
            paciente={pacienteActual}
            setScreen={setScreen}
            setPacientes={setPacientes}
            pacientes={pacientes}
          />
        );

      case "Lista de Pacientes":
        return (
          <ListaPacientesScreen
            pacientes={pacientes}
            setScreen={setScreen}
            setPacienteActual={setPacienteActual}
            setPacientes={setPacientes}
          />
        );

      case "Evaluaciones":
        return <EvaluacionesScreen />;

     
      case "CognitivoMenu":
        return <CognitivoMenuScreen setScreen={setScreen} />;

      case "AfectivoMenu":
        return <AfectivoMenuScreen setScreen={setScreen} />;

      case "FuncionamientoMenu":
        return <FuncionamientoMenuScreen setScreen={setScreen} />;

      case "NutricionalMenu":
        return <NutricionalMenuScreen setScreen={setScreen} />;

      case "EntornoMenu":
        return <EntornoMenuScreen setScreen={setScreen} />;

      case "OARS":
        return <OARSScreen setScreen={setScreen} />;

      default:
        return <HomeScreen setScreen={setScreen} />;
    }
  };

  return (
    <SafeAreaProvider>
      <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={300}
        renderNavigationView={() => (
          <CustomDrawer
            setScreen={setScreen}
            currentScreen={screen}
            setPacienteActual={setPacienteActual}
            closeDrawer={() => drawer.current.closeDrawer()}
            onLogout={() =>
              Alert.alert("Cerrar Sesión", "¿Seguro que desea cerrar sesión?", [
                { text: "Cancelar" },
                { text: "Sí", onPress: () => setScreen("Inicio") },
              ])
            }
          />
        )}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => drawer.current.openDrawer()}>
              <Text style={styles.menu}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{screen}</Text>
          </View>

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
    elevation: 5,
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