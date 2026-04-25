import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
} from "react-native";

import { ref, update } from "firebase/database";
import { db } from "../firebaseConfig";

export default function ObservacionesScreen({
  paciente,
  setPacienteActual,
  setScreen,
}) {
  const [nota, setNota] = useState("");

  if (!paciente) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>
          No hay paciente seleccionado
        </Text>

        <TouchableOpacity
          style={styles.btnVolver}
          onPress={() =>
            setScreen("Lista de Pacientes")
          }
        >
          <Text style={styles.btnText}>
            ⬅ Regresar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const guardarObservacion = async () => {
    if (!nota.trim()) {
      Alert.alert(
        "Error",
        "Escribe una observación"
      );
      return;
    }

    const nuevaObservacion = {
      fecha: new Date().toISOString(),
      medico:
        paciente.medicoNombre ||
        "Sin médico",
      nota: nota.trim(),
    };

    const historial =
      paciente.observaciones || [];

    const nuevasObservaciones = [
      nuevaObservacion,
      ...historial,
    ];

    try {
      await update(
        ref(db, `citas/${paciente.id}`),
        {
          observaciones:
            nuevasObservaciones,
        }
      );

      setPacienteActual({
        ...paciente,
        observaciones:
          nuevasObservaciones,
      });

      setNota("");

      Alert.alert(
        "Éxito",
        "Observación guardada"
      );
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "No se pudo guardar"
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>
        Observaciones
      </Text>

      <Text style={styles.subtitulo}>
        Paciente: {paciente.nombre}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Escribe la observación de la visita"
        multiline
        value={nota}
        onChangeText={setNota}
      />

      <TouchableOpacity
        style={styles.btnGuardar}
        onPress={guardarObservacion}
      >
        <Text style={styles.btnText}>
          💾 Guardar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnVolver}
        onPress={() =>
          setScreen(
            "Lista de Pacientes"
          )
        }
      >
        <Text style={styles.btnText}>
          ⬅ Regresar
        </Text>
      </TouchableOpacity>

      <Text style={styles.subtitulo}>
        Historial de observaciones
      </Text>

      {paciente.observaciones?.length >
      0 ? (
        paciente.observaciones.map(
          (obs, index) => (
            <View
              key={index}
              style={styles.card}
            >
              <Text
                style={styles.fecha}
              >
                📅{" "}
                {new Date(
                  obs.fecha
                ).toLocaleString()}
              </Text>

              <Text>
                🩺 Médico:{" "}
                {obs.medico}
              </Text>

              <Text>
                📝 {obs.nota}
              </Text>
            </View>
          )
        )
      ) : (
        <Text
          style={
            styles.sinObservaciones
          }
        >
          No hay observaciones
          registradas
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f8",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#0D47A1",
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#1565C0",
  },
  input: {
    borderWidth: 1,
    borderColor: "#1565C0",
    borderRadius: 10,
    padding: 15,
    height: 120,
    textAlignVertical: "top",
    backgroundColor: "white",
  },
  btnGuardar: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  btnVolver: {
    backgroundColor: "#757575",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  btnText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  fecha: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#0D47A1",
  },
  sinObservaciones: {
    color: "#777",
    fontStyle: "italic",
    marginTop: 10,
  },
});