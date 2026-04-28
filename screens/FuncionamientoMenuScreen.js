import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function FuncionamientoMenuScreen({ setScreen }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evaluaciones de Funcionamiento</Text>

      {/* BOTÓN VOLVER */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setScreen("Agendar Cita")}
      >
        <Text style={styles.backButtonText}>← Volver a Agenda</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("Katz")}
      >
        <Text style={styles.buttonText}>1. Índice de Katz</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("Lawton")}
      >
        <Text style={styles.buttonText}>2. Índice de Lawton</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("SPPB")}
      >
        <Text style={styles.buttonText}>3. SPPB</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("Frail")}
      >
        <Text style={styles.buttonText}>4. FRAIL</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("Braden")}
      >
        <Text style={styles.buttonText}>5. Escala de Braden</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("Norton")}
      >
        <Text style={styles.buttonText}>6. Escala Norton</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("Audicion")}
      >
        <Text style={styles.buttonText}>7. Audición</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("AgudezaVisual")}
      >
        <Text style={styles.buttonText}>8. Visión</Text>
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