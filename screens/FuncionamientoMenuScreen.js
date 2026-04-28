import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function FuncionamientoMenuScreen({ setScreen }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evaluaciones de Funcionamiento</Text>

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

      <TouchableOpacity style={styles.button}
      onPress={() => setScreen("SPPB")}
      >
        <Text style={styles.buttonText}>3. SPPB</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} 
      onPress={() => setScreen("FRAIL")}
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

      <TouchableOpacity style={styles.button} 
      onPress={() => setScreen("Audicion")}
      >
        <Text style={styles.buttonText}>7. Audicion</Text>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setScreen("AgudezaVisual")}>
        <Text style={styles.buttonText}>8. Visión</Text>
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