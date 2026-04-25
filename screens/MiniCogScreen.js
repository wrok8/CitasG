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

  const puntosTotales = calcularPuntos();

  useEffect(() => {
    if (puntosTotales <= 2) {
      setDeterioro(
        "Posible deterioro cognitivo"
      );
    } else {
      setDeterioro(
        "Sin deterioro cognitivo"
      );
    }
  }, [attempts]);

  const guardarPrueba = () => {
    if (!pacienteActual) {
      Alert.alert(
        "Error",
        "No hay paciente seleccionado"
      );
      return;
    }

    const nuevaPrueba = {
      tipo: "Mini-Cog",
      fecha:
        new Date().toLocaleDateString(),
      puntaje: puntosTotales,
      resultado: deterioro,
      detalle: {
        palabra1,
        palabra2,
        palabra3,
        intentos: attempts,
        sensor: sensorData,
      },
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
    
    setScreen("Agendar Cita");
  };

  const ScoreSwitch = ({
    label,
    id,
  }) => (
    <View style={styles.switchContainer}>
      <Text style={styles.switchLabel}>
        {label}
      </Text>

      <Switch
        value={attempts[id]}
        onValueChange={() =>
          toggleAttempt(id)
        }
      />
    </View>
  );

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
          title="Palabras"
          subtitle="Ingrese las 3 palabras"
        >
          <TextInput
            style={styles.input}
            placeholder="Palabra 1"
            value={palabra1}
            onChangeText={setPalabra1}
          />

          <TextInput
            style={styles.input}
            placeholder="Palabra 2"
            value={palabra2}
            onChangeText={setPalabra2}
          />

          <TextInput
            style={styles.input}
            placeholder="Palabra 3"
            value={palabra3}
            onChangeText={setPalabra3}
          />
        </FormSection>

        <FormSection
          title="Evaluación"
          subtitle="5 puntos"
        >
          <ScoreSwitch
            label="Palabra 1 recordada"
            id="palabra1"
          />

          <ScoreSwitch
            label="Palabra 2 recordada"
            id="palabra2"
          />

          <ScoreSwitch
            label="Palabra 3 recordada"
            id="palabra3"
          />

          <ScoreSwitch
            label="Dibujo de reloj correcto"
            id="dibujoReloj"
          />
        </FormSection>

        <FormSection
          title="Resultado"
          subtitle=""
        >
          <Text style={styles.points}>
            Puntos Totales:{" "}
            {puntosTotales} / 5
          </Text>

          <Text style={styles.result}>
            {deterioro}
          </Text>

          <Text
            style={styles.sensorText}
          >
            Acelerómetro:
            {"\n"}x:{" "}
            {sensorData.x.toFixed(2)}
            {"\n"}y:{" "}
            {sensorData.y.toFixed(2)}
            {"\n"}z:{" "}
            {sensorData.z.toFixed(2)}
          </Text>
        </FormSection>

        <TouchableOpacity
          style={styles.btnSubmit}
          onPress={guardarPrueba}
        >
          <Text
            style={
              styles.btnTextSubmit
            }
          >
            GUARDAR EVALUACIÓN
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
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
  },
  points: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  result: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "bold",
  },
  sensorText: {
    marginTop: 15,
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
  btnTextSubmit: {
    color: "white",
    fontWeight: "bold",
  },
});