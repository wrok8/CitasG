import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  DrawerLayoutAndroid,
  TouchableOpacity,
  Alert,
} from "react-native";

import { EvaluationProvider } from './context/EvaluationContext';
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
import FluenciaVerbalAnimales from "./screens/FluenciaVerbalScreen";
import MiniCogScreen from "./screens/MiniCogScreen";
import MiniMentalScreen from "./screens/MiniMentalScreen";
import MoCAScreen from "./screens/MoCAScreen";
import GDS15Screen from "./screens/GDS15Screen";
import KatzScreen from "./screens/KatzScreen";
import LawtonScreen from "./screens/LawtonScreen";
import BradenScreen from "./screens/BradenScreen";
import NortonScreen from "./screens/NortonScreen";

import CognitivoMenuScreen from "./screens/CognitivoMenuScreen";
import AfectivoMenuScreen from "./screens/AfectivoMenuScreen";
import FuncionamientoMenuScreen from "./screens/FuncionamientoMenuScreen";
import NutricionalMenuScreen from "./screens/NutricionalMenuScreen";
import CESD7Screen from "./screens/CESD7Screen";

import CustomDrawer from "./components/CustomDrawer";

function MainApp() {
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
          pacientes={pacientes}
          setPacientes={setPacientes}
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
        return <OARSScreen setScreen={setScreen} pacienteActual={pacienteActual} />;

        case "MoCA":
  return (
    <MoCAScreen
      setScreen={setScreen}
      pacienteActual={pacienteActual}
      setPacienteActual={setPacienteActual}
    />
  );

     case "FluenciaVerbal":
      return (
        <FluenciaVerbalAnimales
          setScreen={setScreen}
          pacienteActual={pacienteActual}
          setPacienteActual={setPacienteActual}
        />
      );
      case "Mini-Cog":
      return (
        <MiniCogScreen
          setScreen={setScreen}
          pacienteActual={pacienteActual}
          setPacienteActual={setPacienteActual}
        />
      );
      case "Mini-Mental":
      return (
        <MiniMentalScreen
          setScreen={setScreen}
          pacienteActual={pacienteActual}
          setPacienteActual={setPacienteActual}
        />
      );

      case "GDS-15":
  return (
    <GDS15Screen
      setScreen={setScreen}
      pacienteActual={pacienteActual}
      setPacienteActual={setPacienteActual}
    />
  );

  case "CESD-7":
  return (
    <CESD7Screen
      setScreen={setScreen}
      pacienteActual={pacienteActual}
      setPacienteActual={setPacienteActual}
    />
  );
  case "Katz":
  return (
    <KatzScreen
      setScreen={setScreen}
      pacienteActual={pacienteActual}
      setPacienteActual={setPacienteActual}
    />
  );
  case "Lawton":
  return (
    <LawtonScreen
      setScreen={setScreen}
      pacienteActual={pacienteActual}
      setPacienteActual={setPacienteActual}
    />
  );

  case "Braden":
  return (
    <BradenScreen
      setScreen={setScreen}
      pacienteActual={pacienteActual}
      setPacienteActual={setPacienteActual}
    />
  );
      
  case "Norton":
  return (
    <NortonScreen
      setScreen={setScreen}
      pacienteActual={pacienteActual}
      setPacienteActual={setPacienteActual}
    />
  );

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

export default function App() {
  return (
    <EvaluationProvider>
      <MainApp />
    </EvaluationProvider>
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