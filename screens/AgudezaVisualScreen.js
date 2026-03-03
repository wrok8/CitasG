import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";

export default function AgudezaVisualScreen({ setScreen, pacienteActual, setPacienteActual }) {
  const [verificado, setVerificado] = useState(false);

  const toggleSwitch = () => setVerificado(!verificado);

  const empezarPrueba = () => {
    if (!verificado) {
      Alert.alert(
        "Verificación requerida",
        "Por favor, asegúrese de que la E tenga las dimensiones correctas antes de continuar."
      );
      return;
    }

    // Ir a la prueba de visión
    setScreen("VisionTest");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agudeza Visual</Text>
      <Text style={styles.subtitle}>Clinica Geriátrica</Text>

      <Text style={styles.parrafo}>
        Usando una regla, verifique el ancho y largo de la E. Para que la prueba sea válida,
        la E debe medir 2.5 cm de ancho y 2.5 cm de largo. Si la E no tiene estas dimensiones,
        los resultados de la prueba pueden no ser precisos.
      </Text>

      <View style={styles.switchRow}>
        <Text style={styles.label}>He verificado que la E mide 2.5 cm x 2.5 cm</Text>
        <Switch
          value={verificado}
          onValueChange={toggleSwitch}
          trackColor={{ false: "#767577", true: "#ff81ee" }}
          thumbColor={verificado ? "#f54b7e" : "#f4f3f4"}
        />
      </View>

      <Image
        source={require("../assets/images/ERight.png")}
        style={styles.image}
      />

      <TouchableOpacity style={styles.button} onPress={empezarPrueba}>
        <Text style={styles.buttonText}>Empezar Prueba</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f6f8" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 5 },
  subtitle: { fontSize: 20, color: "purple", textAlign: "center", marginBottom: 20 },
  parrafo: { fontSize: 16, textAlign: "justify", marginBottom: 20 },
  switchRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, justifyContent: "space-between" },
  label: { fontSize: 16, flex: 1, marginRight: 10 },
  image: { width: 200, height: 200, alignSelf: "center", marginBottom: 30 },
  button: { backgroundColor: "purple", padding: 15, borderRadius: 10 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold", textAlign: "center" },
});