import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ResumenScreen({
  paciente,
  setScreen,
  setPacientes,
  pacientes,
}) {
  if (!paciente) return null;

  const seleccionadas = Object.keys(paciente.evaluaciones).filter(
    (key) => paciente.evaluaciones[key]
  );

  const guardarPaciente = () => {
    const existe = pacientes.includes(paciente);

    if (!existe) {
      setPacientes([...pacientes, paciente]);
    }

    setScreen("Lista de Pacientes");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen de la Cita</Text>

      <Text>Nombre: {paciente.nombre}</Text>
      <Text>Contacto: {paciente.contacto}</Text>
      <Text>Email: {paciente.email}</Text>
      <Text>Teléfono: {paciente.telefono}</Text>
      <Text>
        Fecha: {new Date(paciente.fecha).toLocaleDateString()}
      </Text>
      <Text>Síntomas: {paciente.sintomas}</Text>

      <Text style={styles.subtitle}>Evaluaciones:</Text>
      {seleccionadas.map((e) => (
        <Text key={e}>• {e}</Text>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("Agendar Cita")}
      >
        <Text style={styles.buttonText}>Regresar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={guardarPaciente}>
        <Text style={styles.buttonText}>Guardar y Ver Lista</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  subtitle: { marginTop: 15, fontWeight: "bold" },
  button: {
    backgroundColor: "#1565C0",
    padding: 15,
    marginTop: 15,
    borderRadius: 6,
  },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});