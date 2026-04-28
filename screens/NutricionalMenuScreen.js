import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function NutricionalMenuScreen({ setScreen }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evaluaciones Nutricionales</Text>

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
    backgroundColor: "#f4f6f8"
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#0D47A1",
    textAlign: "center"
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