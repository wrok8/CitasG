import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function CustomDrawer({
  setScreen,
  closeDrawer,
  onLogout,
  setPacienteActual,   
}) {
  const Item = ({ label }) => (
  <TouchableOpacity
    style={styles.item}
    onPress={() => {
      if (label === "Agendar Cita") {
        setPacienteActual(null); 
      }

      setScreen(label);
      closeDrawer();
    }}
  >
    <Text style={styles.text}>{label}</Text>
  </TouchableOpacity>
);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.avatar}
        />
        <Text style={styles.username}>Clínica Geriátrica</Text>
      </View>

      <Item label="Inicio" />
      <Item label="Agregar Personal" />
      <Item label="Agendar Cita" />
      <Item label="Lista de Pacientes" />
      <Item label="Evaluaciones" />
      <Item label="Perfil" />
      <Item label="Configuración" />
      <Item label="Mapa" />
      <Item label="Signos Vitales" />
      
      <TouchableOpacity
      onPress={() => {
        setScreen("Graficas");
        closeDrawer();
      }}
    >
      <Text>📊 Dashboard</Text>
    </TouchableOpacity>
      <TouchableOpacity onPress={() => setScreen("Clima")}>
      <Text>Clima</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setScreen("Usuarios")}>
      <Text>👤 Usuarios</Text>
     </TouchableOpacity>

     <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        setScreen("Bitacora");
        closeDrawer();
      }}
    >
      <Text style={styles.menuText}>
        📘 Bitácora
      </Text>
    </TouchableOpacity>

      <TouchableOpacity style={styles.logout} onPress={onLogout}>
        <Text style={styles.logoutText}>Salir</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setScreen("Preferencias Paciente")}>
        <Text>⚙️ Preferencias Paciente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E3F2FD" },
  header: {
    padding: 20,
    backgroundColor: "#1565C0",
    alignItems: "center",
  },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  username: {
    color: "white",
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#BBDEFB",
  },
  text: { fontSize: 16, fontWeight: "bold", color: "#0D47A1" },
  logout: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#0D47A1",
  },
  logoutText: { color: "white", textAlign: "center", fontWeight: "bold" },
});