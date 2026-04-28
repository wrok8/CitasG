import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { Accelerometer } from "expo-sensors";

const BRADEN_TABLE = [
  {
    criterio: "Percepción sensoria",
    opciones: [
      "Completamente limitada",
      "Muy limitada",
      "Ligeramente limitada",
      "Sin limitaciones",
    ],
    riesgo: "1-2 Con riesgo, 3-4 Sin riesgo",
  },
  {
    criterio: "Exposición a la humedad",
    opciones: [
      "Completamente húmeda",
      "A menudo húmeda",
      "Ocasionalmente húmeda",
      "Raramente húmeda",
    ],
    riesgo: "1-2 Con riesgo, 3-4 Sin riesgo",
  },
  {
    criterio: "Actividad",
    opciones: [
      "Encamado/a",
      "En silla",
      "Deambula ocasionalmente",
      "Deambula frecuentemente",
    ],
    riesgo: "1-2 Con riesgo, 3-4 Sin riesgo",
  },
  {
    criterio: "Movilidad",
    opciones: [
      "Completamente inmóvil",
      "Muy limitada",
      "Ligeramente limitada",
      "Sin limitaciones",
    ],
    riesgo: "1-2 Con riesgo, 3-4 Sin riesgo",
  },
  {
    criterio: "Nutrición",
    opciones: [
      "Muy pobre",
      "Probablemente inadecuada",
      "Adecuada",
      "Excelente",
    ],
    riesgo: "1-2 Con riesgo, 3-4 Sin riesgo",
  },
  {
    criterio: "Roce de peligro de lesiones",
    opciones: [
      "Problema",
      "Probablemente inadecuada",
      "Adecuada",
      "Sin limitaciones",
    ],
    riesgo: "1-2 Con riesgo, 3-4 Sin riesgo",
  },
];

export default function BradenScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const crearRespuestasVacias = () =>
    BRADEN_TABLE.reduce(
      (acc, c) => ({ ...acc, [c.criterio]: null }),
      {}
    );

  const [respuestas, setRespuestas] = useState(
    crearRespuestasVacias()
  );

  // SENSOR
  useEffect(() => {
    Accelerometer.setUpdateInterval(300);

    const subscription = Accelerometer.addListener((data) => {
      const movimiento =
        Math.abs(data.x) +
        Math.abs(data.y) +
        Math.abs(data.z);

      if (movimiento > 2.7) {
        Alert.alert(
          "Sensor detectado",
          "¿Deseas limpiar todas las respuestas?",
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Limpiar",
              onPress: () =>
                setRespuestas(crearRespuestasVacias()),
            },
          ]
        );
      }
    });

    return () => subscription.remove();
  }, []);

  const seleccionar = (criterio, valor) => {
    setRespuestas((prev) => ({
      ...prev,
      [criterio]: valor,
    }));
  };

  const guardarPrueba = () => {
    if (Object.values(respuestas).includes(null)) {
      Alert.alert(
        "Atención",
        "Responde todos los criterios."
      );
      return;
    }

    if (!pacienteActual) {
      Alert.alert(
        "Error",
        "No hay paciente seleccionado"
      );
      return;
    }

    const puntajeTotal = Object.values(
      respuestas
    ).reduce((sum, val) => sum + val, 0);

    let interpretacion = "";

    if (puntajeTotal < 12)
      interpretacion = "Alto riesgo";
    else if (puntajeTotal <= 14)
      interpretacion = "Riesgo medio";
    else interpretacion = "Bajo riesgo";

    const nuevaEvaluacion = {
      tipo: "Escala de Braden",
      fecha: new Date().toLocaleDateString(),
      puntaje: puntajeTotal,
      detalle: {
        respuestas,
        interpretacion,
      },
    };

    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), nuevaEvaluacion],
    }));

    Alert.alert(
      "Prueba Guardada",
      `Puntaje: ${puntajeTotal}\n${interpretacion}`
    );

    setScreen("Agendar Cita");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Escala de Braden
      </Text>

      <Text style={styles.sensorInfo}>
        📱 Agita el dispositivo para limpiar respuestas
      </Text>

      {BRADEN_TABLE.map((c, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.pregunta}>
            {idx + 1}) {c.criterio}
          </Text>

          {c.opciones.map((op, i) => (
            <Pressable
              key={i}
              style={[
                styles.opcion,
                respuestas[c.criterio] === i + 1 &&
                  styles.selected,
              ]}
              onPress={() =>
                seleccionar(c.criterio, i + 1)
              }
            >
              <Text
                style={
                  respuestas[c.criterio] === i + 1
                    ? styles.selectedText
                    : styles.text
                }
              >
                {i + 1}. {op}
              </Text>
            </Pressable>
          ))}

          <Text style={styles.riesgo}>
            <Text style={{ fontWeight: "bold" }}>
              Riesgo:
            </Text>{" "}
            {c.riesgo}
          </Text>
        </View>
      ))}

      <Pressable
        style={styles.botonGuardar}
        onPress={guardarPrueba}
      >
        <Text style={styles.botonTexto}>
          Guardar Prueba
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F4F6F8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#0D47A1",
  },
  sensorInfo: {
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  pregunta: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  opcion: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
  },
  selected: {
    backgroundColor: "#1565C0",
    borderColor: "#1565C0",
  },
  text: {
    color: "black",
  },
  selectedText: {
    color: "white",
    fontWeight: "bold",
  },
  riesgo: {
    marginTop: 5,
    fontSize: 12,
    color: "#555",
  },
  botonGuardar: {
    backgroundColor: "#2E7D32",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  botonTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});