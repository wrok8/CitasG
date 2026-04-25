// screens/ResumenScreen.js
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { update, ref } from "firebase/database";
import { db } from "../firebaseConfig";
import { guardarMovimiento } from "../database";

export default function ResumenScreen({
  paciente,
  setScreen,
}) {
  if (!paciente) {
    return (
      <View style={styles.container}>
        <Text>No hay paciente</Text>
      </View>
    );
  }

  const pruebas = paciente.pruebas || [];
  const signos =
    paciente.signosVitales || [];

  const ultimaMedicion =
    signos[0] || null;

  const cambiarEstado = async (nuevoEstado) => {
    try {
      await update(
        ref(db, `citas/${paciente.id}`),
        {
          status: nuevoEstado,
        }
      );

      await guardarMovimiento(
        paciente.medicoNombre || "Sistema",
        `Estado cambiado a ${nuevoEstado}`
      );

      Alert.alert(
        "Estado actualizado",
        nuevoEstado
      );
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "No se pudo actualizar"
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>
        Resumen Clínico
      </Text>

      <View style={styles.card}>
        <Text style={styles.nombre}>
          {paciente.nombre}
        </Text>

        <Text>
          📅 Fecha:{" "}
          {new Date(
            paciente.fecha
          ).toLocaleDateString()}
        </Text>

        <Text>
          📌 Estado:{" "}
          {paciente.status}
        </Text>

        <Text>
          🩺 Médico:{" "}
          {paciente.medicoNombre}
        </Text>

        <Text>
          🤒 Síntomas:{" "}
          {paciente.sintomas}
        </Text>

        {paciente.observaciones?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.subtitulo}>
            Última observación
          </Text>

          <Text>
            {
              paciente.observaciones[0].nota
            }
          </Text>
        </View>
      )}
      </View>

      {ultimaMedicion && (
        <View style={styles.card}>
          <Text style={styles.subtitulo}>
            Últimos Signos Vitales
          </Text>

          <Text>
            ❤️ FC: {ultimaMedicion.bpm} BPM
          </Text>

          <Text>
            🌡️ Temp:{" "}
            {ultimaMedicion.temp}°C
          </Text>

          <Text>
            💧 SpO₂:{" "}
            {ultimaMedicion.spo2}%
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.subtitulo}>
          Evaluaciones
        </Text>

        {pruebas.length === 0 ? (
          <Text>
            No hay pruebas
          </Text>
        ) : (
          pruebas.map((p, index) => (
            <View
              key={index}
              style={styles.prueba}
            >
              <Text>
                📋 {p.tipo}
              </Text>
              <Text>
                Puntaje:{" "}
                {p.puntaje || 0}
              </Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.btnAgenda}
        onPress={() =>
          cambiarEstado("Agenda")
        }
      >
        <Text style={styles.btnText}>
          Agenda
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnCurso}
        onPress={() =>
          cambiarEstado("En curso")
        }
      >
        <Text style={styles.btnText}>
          En Curso
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnConcluir}
        onPress={() =>
          cambiarEstado(
            "Concluida"
          )
        }
      >
        <Text style={styles.btnText}>
          Concluir
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnCurso}
        onPress={() => setScreen("Observaciones")}
      >
        <Text style={styles.btnText}>
          📝 Observaciones
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
          Volver
        </Text>
      </TouchableOpacity>
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
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  nombre: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  prueba: {
    marginBottom: 10,
  },
  btnAgenda: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  btnCurso: {
    backgroundColor: "#FB8C00",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  btnConcluir: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  btnVolver: {
    backgroundColor: "#757575",
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  btnText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});