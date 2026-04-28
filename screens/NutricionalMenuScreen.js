import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function NutricionalMenuScreen({ setScreen }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evaluaciones Nutricionales</Text>

      {/* BOTÓN VOLVER */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setScreen("Agendar Cita")}
      >
        <Text style={styles.backButtonText}>← Volver a Agenda</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("MNA-SF")}
      >
        <Text style={styles.buttonText}>1. MNA-SF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("MUST")}
      >
        <Text style={styles.buttonText}>2. MUST</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("SARC-F")}
      >
        <Text style={styles.buttonText}>3. SARC-F</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f8",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#0D47A1",
    textAlign: "center",
  },

  backButton: {
    backgroundColor: "#6C757D",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },

  backButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
  },

  button: {
    backgroundColor: "#1565C0",
    padding: 18,
    borderRadius: 12,
    marginVertical: 8,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});