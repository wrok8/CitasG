import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function EntornoMenuScreen({ setScreen }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evaluaciones de Entorno</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("OARS")}
      >
        <Text style={styles.buttonText}>1. OARS</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("Maltrato")}
      >
        <Text style={styles.buttonText}>
          2. Escala geriátrica de maltrato
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.disabled]}>
        <Text style={styles.buttonText}>
          3. Movilidad en el entorno
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#0D47A1",
  },
  button: {
    backgroundColor: "#1565C0",
    padding: 18,
    borderRadius: 12,
    marginVertical: 8,
  },
  disabled: {
    backgroundColor: "#90A4AE",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});