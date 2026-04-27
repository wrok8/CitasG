import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function AfectivoMenuScreen({ setScreen }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evaluaciones Afectivas</Text>

      {/* GDS-15 */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("GDS-15")}
      >
        <Text style={styles.buttonText}>1. GDS-15</Text>
      </TouchableOpacity>

      {/* CESD-7 */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("CESD-7")}
      >
        <Text style={styles.buttonText}>2. CESD-7 Items</Text>
      </TouchableOpacity>

      {/* Botón volver */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setScreen("Agendar Cita")}
      >
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4F6F8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#0D47A1",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1565C0",
    padding: 18,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1565C0",
    alignItems: "center",
  },
  backText: {
    color: "#1565C0",
    fontWeight: "bold",
    fontSize: 16,
  },
});