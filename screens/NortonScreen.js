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

const NORTON_TABLE = [
  {
    criterio: "Estado físico",
    opciones: [
      "Muy enfermo",
      "Enfermo",
      "Algo limitado",
      "Bueno",
    ],
  },
  {
    criterio: "Estado mental",
    opciones: [
      "Confundido",
      "Algo confuso",
      "Normal",
      "Orientado",
    ],
  },
  {
    criterio: "Actividad",
    opciones: [
      "Postrado",
      "Sentado sin deambular",
      "Se levanta ocasionalmente",
      "Deambula normalmente",
    ],
  },
  {
    criterio: "Movilidad",
    opciones: [
      "Completamente inmóvil",
      "Muy limitada",
      "Ligeramente limitada",
      "Sin limitaciones",
    ],
  },
  {
    criterio: "Incontinencia",
    opciones: [
      "Totalmente incontinente",
      "A menudo incontinente",
      "Ocasionalmente incontinente",
      "Continente",
    ],
  },
];

export default function NortonScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const crearRespuestasVacias = () =>
    NORTON_TABLE.reduce(
      (acc, c) => ({
        ...acc,
        [c.criterio]: null,
      }),
      {}
    );

  const [respuestas, setRespuestas] = useState(
    crearRespuestasVacias()
  );

  // SENSOR
  useEffect(() => {
    Accelerometer.setUpdateInterval(300);

    const subscription =
      Accelerometer.addListener((data) => {
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
                  setRespuestas(
                    crearRespuestasVacias()
                  ),
              },
            ]
          );
        }
      });

    return () => subscription.remove();
  }, []);

  const seleccionar = (
    criterio,
    valor
  ) => {
    setRespuestas((prev) => ({
      ...prev,
      [criterio]: valor,
    }));
  };

  const guardarPrueba = () => {
    if (
      Object.values(respuestas).includes(null)
    ) {
      Alert.alert(
        "Atención",
        "Responde todos los criterios antes de guardar."
      );
      return;
    }

    if (!pacienteActual) {
      Alert.alert(
        "Error",
        "No hay paciente seleccionado."
      );
      return;
    }

    const puntajeTotal =
      Object.values(respuestas).reduce(
        (sum, val) => sum + val,
        0
      );

    let interpretacion =
      puntajeTotal <= 12
        ? "ALTO RIESGO"
        : puntajeTotal <= 16
        ? "RIESGO MODERADO"
        : "RIESGO MÍNIMO";

    const nuevaEvaluacion = {
      tipo: "Escala de Norton",
      fecha: new Date().toLocaleDateString(),
      puntaje: puntajeTotal,
      detalle: {
        respuestas,
        interpretacion,
      },
    };

    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [
        ...(prev?.pruebas || []),
        nuevaEvaluacion,
      ],
    }));

    Alert.alert(
      "Prueba Guardada",
      `Puntaje: ${puntajeTotal}\nInterpretación: ${interpretacion}`,
      [
        {
          text: "OK",
          onPress: () =>
            setScreen("Agendar Cita"),
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >
      <Text style={styles.title}>
        Escala de Norton
      </Text>

      <Text style={styles.sensorInfo}>
        📱 Agita el dispositivo para limpiar respuestas
      </Text>

      {NORTON_TABLE.map((c, idx) => (
        <View
          key={idx}
          style={styles.card}
        >
          <Text
            style={styles.pregunta}
          >
            {idx + 1}) {c.criterio}
          </Text>

          {c.opciones.map((op, i) => (
            <Pressable
              key={i}
              style={[
                styles.opcion,
                respuestas[
                  c.criterio
                ] ===
                  i + 1 &&
                  styles.selected,
              ]}
              onPress={() =>
                seleccionar(
                  c.criterio,
                  i + 1
                )
              }
            >
              <Text
                style={
                  respuestas[
                    c.criterio
                  ] ===
                  i + 1
                    ? styles.selectedText
                    : styles.text
                }
              >
                {i + 1}. {op}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}

      <Pressable
        style={styles.botonGuardar}
        onPress={guardarPrueba}
      >
        <Text
          style={styles.botonTexto}
        >
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
    backgroundColor: "#00cec9",
    borderColor: "#00cec9",
  },
  text: {
    color: "black",
  },
  selectedText: {
    color: "white",
    fontWeight: "bold",
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