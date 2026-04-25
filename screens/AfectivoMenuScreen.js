import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Accelerometer } from "expo-sensors";

import { FormSection } from "../components/FormSection";

export default function MiniCogScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const [palabra1, setPalabra1] = useState("");
  const [palabra2, setPalabra2] = useState("");
  const [palabra3, setPalabra3] = useState("");

  const [resultado, setResultado] = useState("");
  const [deterioro, setDeterioro] = useState("");

  const [sensorData, setSensorData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [attempts, setAttempts] = useState({
    palabra1: false,
    palabra2: false,
    palabra3: false,
    dibujoReloj: false,
  });

  useEffect(() => {
    const subscription =
      Accelerometer.addListener((data) => {
        setSensorData(data);
      });

    Accelerometer.setUpdateInterval(1000);

    return () => subscription.remove();
  }, []);

  const toggleAttempt = (key) => {
    setAttempts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const calcularPuntos = () => {
    let puntos = 0;

    if (attempts.palabra1) puntos += 1;
    if (attempts.palabra2) puntos += 1;
    if (attempts.palabra3) puntos += 1;
    if (attempts.dibujoReloj) puntos += 2;

    return puntos;
  };

  useEffect(() => {
    const puntos = calcularPuntos();

    if (puntos <= 2) {
      setDeterioro(
        "Posible deterioro cognitivo"
      );
    } else {
      setDeterioro(
        "Sin deterioro cognitivo"
      );
    }
  }, [attempts]);

  const guardarEvaluacion = () => {
    if (!pacienteActual) {
      Alert.alert(
        "Error",
        "No hay paciente seleccionado"
      );
      return;
    }

    const puntosTotales =
      calcularPuntos();

    const nuevaPrueba = {
      tipo: "Mini-Cog",
      fecha:
        new Date().toLocaleDateString(),
      puntaje: puntosTotales,
      detalle: [
        "Palabra 1: " + palabra1,
        "Palabra 2: " + palabra2,
        "Palabra 3: " + palabra3,
        "Resultado: " + deterioro,
      ],
    };

    const pruebasActualizadas =
      Array.isArray(
        pacienteActual.pruebas
      )
        ? [
            ...pacienteActual.pruebas,
            nuevaPrueba,
          ]
        : [nuevaPrueba];

    setPacienteActual({
      ...pacienteActual,
      pruebas: pruebasActualizadas,
    });

    Alert.alert(
      "Evaluación guardada",
      `Puntaje total: ${puntosTotales}/5`
    );

    
    setScreen("Agendar Cita");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContainer
        }
      >
        <Text style={styles.titulo}>
          Mini-Cog
        </Text>

        <Text style={styles.subtitulo}>
          Diga 3 palabras y dibuje un reloj
        </Text>

        <FormSection
          title="Registro de palabras"
          subtitle="Ingrese las palabras"
        >
          <Text style={styles.label}>
            Palabra 1
          </Text>
          <TextInput
            style={styles.input}
            value={palabra1}
            onChangeText={setPalabra1}
          />

          <Text style={styles.label}>
            Palabra 2
          </Text>
          <TextInput
            style={styles.input}
            value={palabra2}
            onChangeText={setPalabra2}
          />

          <Text style={styles.label}>
            Palabra 3
          </Text>
          <TextInput
            style={styles.input}
            value={palabra3}
            onChangeText={setPalabra3}
          />
        </FormSection>

        <FormSection
          title="Evaluación"
          subtitle="Puntuación"
        >
          <View
            style={styles.switchContainer}
          >
            <Text>Palabra 1</Text>
            <Switch
              value={
                attempts.palabra1
              }
              onValueChange={() =>
                toggleAttempt(
                  "palabra1"
                )
              }
            />
          </View>

          <View
            style={styles.switchContainer}
          >
            <Text>Palabra 2</Text>
            <Switch
              value={
                attempts.palabra2
              }
              onValueChange={() =>
                toggleAttempt(
                  "palabra2"
                )
              }
            />
          </View>

          <View
            style={styles.switchContainer}
          >
            <Text>Palabra 3</Text>
            <Switch
              value={
                attempts.palabra3
              }
              onValueChange={() =>
                toggleAttempt(
                  "palabra3"
                )
              }
            />
          </View>

          <View
            style={styles.switchContainer}
          >
            <Text>
              Dibujo de reloj
            </Text>
            <Switch
              value={
                attempts.dibujoReloj
              }
              onValueChange={() =>
                toggleAttempt(
                  "dibujoReloj"
                )
              }
            />
          </View>
        </FormSection>

        <FormSection
          title="Resultado"
          subtitle=""
        >
          <Text style={styles.points}>
            Puntos:{" "}
            {calcularPuntos()} / 5
          </Text>

          <Text style={styles.result}>
            {deterioro}
          </Text>

          <Text
            style={styles.sensorText}
          >
            Sensor X:{" "}
            {sensorData.x.toFixed(2)} |
            Y:{" "}
            {sensorData.y.toFixed(2)} |
            Z:{" "}
            {sensorData.z.toFixed(2)}
          </Text>
        </FormSection>

        <TouchableOpacity
          style={styles.btnSubmit}
          onPress={guardarEvaluacion}
        >
          <Text
            style={styles.btnText}
          >
            GUARDAR Y AGENDAR CITA
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitulo: {
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "white",
    marginTop: 5,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginVertical: 8,
  },
  points: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  result: {
    textAlign: "center",
    marginTop: 10,
    fontWeight: "bold",
  },
  sensorText: {
    marginTop: 10,
    textAlign: "center",
    color: "#666",
  },
  btnSubmit: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});