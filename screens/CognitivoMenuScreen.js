import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function CognitivoMenuScreen({ setScreen }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evaluaciones Cognitivas</Text>

      {/* BOTÓN VOLVER */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setScreen("Agendar Cita")}
      >
        <Text style={styles.backButtonText}>← Volver a Agenda</Text>
      </TouchableOpacity>

      {/* Fluencia Verbal */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("FluenciaVerbal")}
      >
        <Text style={styles.buttonText}>
          1. Fluencia verbal semántica
        </Text>
      </TouchableOpacity>

      {/* Mini-Cog */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("Mini-Cog")}
      >
        <Text style={styles.buttonText}>
          2. Mini-Cog
        </Text>
      </TouchableOpacity>

      {/* Mini-Mental */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("Mini-Mental")}
      >
        <Text style={styles.buttonText}>
          3. Mini-Mental
        </Text>
      </TouchableOpacity>

      {/* MoCA */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("MoCA")}
      >
        <Text style={styles.buttonText}>
          4. MoCA
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: "#f4f6f8"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#0D47A1",
    textAlign: "center"
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