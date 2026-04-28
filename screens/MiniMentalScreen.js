import React, { useState, useContext } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { EvaluationContext } from "../context/EvaluationContext";

export default function MiniMentalScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const { guardarResultadoPrueba } = useContext(EvaluationContext);

  const [puntajeConocimiento, setPuntajeConocimiento] = useState(0);

  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const obtenerInterpretacion = (puntaje) => {
    if (puntaje <= 24) return "Probable deterioro cognitivo";
    return "Sin deterioro cognitivo";
  };

  const handleGuardar = () => {
    const puntajeTotal = Number(puntajeConocimiento);
    const interpretacion = obtenerInterpretacion(puntajeTotal);

    const resultado = {
      nombre: "MMSE",
      puntaje: puntajeTotal,
      puntajeMax: 30,
      interpretacion: interpretacion,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      detalles: {
        puntajeConocimientos: puntajeTotal,
      },
    };

    guardarResultadoPrueba("MMSE", resultado);

    if (pacienteActual) {
      const nuevaPrueba = {
        tipo: "Mini-Mental",
        fecha: new Date().toLocaleDateString(),
        puntaje: puntajeTotal,
        detalle: [
          `Puntaje Conocimientos: ${puntajeConocimiento}`,
          `Interpretación: ${interpretacion}`,
        ],
      };

      const pruebasActuales = pacienteActual.pruebas || [];

      const pacienteActualizado = {
        ...pacienteActual,
        pruebas: [...pruebasActuales, nuevaPrueba],
      };

      setPacienteActual(pacienteActualizado);
    }

    Alert.alert("✅ Éxito", `MMSE guardado\nPuntaje: ${puntajeTotal}/30\n${interpretacion}`);

    setScreen("Agendar Cita");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <View style={styles.headerCard}>
          <Text style={{ fontSize: 28 }}>🧠</Text>
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.title}>Evaluación Mini Mental</Text>
            <Text style={styles.subtitle}>
              Evaluación de deterioro cognitivo
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Conocimientos</Text>

          <Text style={styles.instructionText}>
            Puntaje total obtenido (0 - 30)
          </Text>

          <TouchableOpacity
            style={styles.scoreBox}
            onPress={() =>
              setPuntajeConocimiento(
                puntajeConocimiento < 30
                  ? puntajeConocimiento + 1
                  : 0
              )
            }
          >
            <Text style={styles.scoreText}>
              {puntajeConocimiento}
            </Text>
            <Text style={{ fontSize: 12, color: "#666" }}>
              (Toque para aumentar)
            </Text>
          </TouchableOpacity>

          <Text style={styles.interpretacion}>
            {puntajeConocimiento <= 24
              ? "Probable deterioro cognitivo"
              : "Sin deterioro cognitivo"}
          </Text>
        </View>

        <View
          style={[
            styles.footer,
            {
              flexDirection: isMobile ? "column" : "row",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.btnCancel}
            onPress={() => setScreen("CognitivoMenu")}
          >
            <Text style={styles.btnTextCancel}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSubmit}
            onPress={handleGuardar}
          >
            <Text style={styles.btnTextSubmit}>
              Registrar Puntuación
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { flex: 1 },
  contentContainer: { padding: 20 },

  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001D3D",
  },

  subtitle: {
    fontSize: 13,
    color: "#666",
  },

  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  instructionText: {
    fontSize: 15,
    marginBottom: 10,
  },

  scoreBox: {
    backgroundColor: "#E8F0FE",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 15,
  },

  scoreText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#001D3D",
  },

  interpretacion: {
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 10,
  },

  footer: {
    gap: 12,
  },

  btnCancel: {
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
    alignItems: "center",
    marginBottom: 10,
  },

  btnSubmit: {
    backgroundColor: "#000814",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnTextCancel: {
    fontWeight: "700",
  },

  btnTextSubmit: {
    color: "#FFF",
    fontWeight: "700",
  },
});