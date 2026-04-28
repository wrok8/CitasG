import React, { useState, useContext } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { EvaluationContext } from "../context/EvaluationContext";

const MiniCogScreen = ({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) => {
  const { guardarResultadoPrueba } = useContext(EvaluationContext);

  const [palabra1, setPalabra1] = useState("");
  const [palabra2, setPalabra2] = useState("");
  const [palabra3, setPalabra3] = useState("");

  const [attempts, setAttempts] = useState({
    palabra1: false,
    palabra2: false,
    palabra3: false,
    dibujoReloj: false,
  });

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

  const obtenerInterpretacion = (puntaje) => {
    if (puntaje >= 4) return "Cognición normal";
    if (puntaje >= 2) return "Deterioro leve";
    return "Deterioro probable";
  };

  const handleEnviar = () => {
    const puntajeTotal = calcularPuntos();
    const interpretacion = obtenerInterpretacion(puntajeTotal);

    const resultado = {
      nombre: "Mini-Cog",
      puntaje: puntajeTotal,
      puntajeMax: 5,
      interpretacion: interpretacion,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      detalles: {
        palabra1: palabra1,
        palabra2: palabra2,
        palabra3: palabra3,
        intentos: {
          palabra1: attempts.palabra1,
          palabra2: attempts.palabra2,
          palabra3: attempts.palabra3,
        },
        dibujoReloj: attempts.dibujoReloj,
      },
    };

    guardarResultadoPrueba("Mini-Cog", resultado);

    if (pacienteActual) {
      const nuevaPrueba = {
        tipo: "Mini-Cog",
        fecha: new Date().toLocaleDateString(),
        puntaje: puntajeTotal,
        detalle: [
          `Palabra 1: ${palabra1}`,
          `Palabra 2: ${palabra2}`,
          `Palabra 3: ${palabra3}`,
          `Intento 1: ${attempts.palabra1 ? "Correcto" : "Incorrecto"}`,
          `Intento 2: ${attempts.palabra2 ? "Correcto" : "Incorrecto"}`,
          `Intento 3: ${attempts.palabra3 ? "Correcto" : "Incorrecto"}`,
          `Dibujo Reloj: ${attempts.dibujoReloj ? "Correcto" : "Incorrecto"}`,
        ],
      };

      const pruebasActuales = pacienteActual.pruebas || [];

      const pacienteActualizado = {
        ...pacienteActual,
        pruebas: [...pruebasActuales, nuevaPrueba],
      };

      setPacienteActual(pacienteActualizado);
    }

    Alert.alert("✅ Éxito", `Mini-Cog guardado\nPuntaje: ${puntajeTotal}/5\n${interpretacion}`);

    setScreen("Agendar Cita");
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.titulo}>Mini-Cog</Text>
      <Text style={styles.subtitulo}>
        Diga 3 palabras y dibuje un reloj
      </Text>

      <Text style={styles.label}>Palabra 1:</Text>
      <TextInput
        style={styles.input}
        value={palabra1}
        onChangeText={setPalabra1}
      />

      <Text style={styles.label}>Palabra 2:</Text>
      <TextInput
        style={styles.input}
        value={palabra2}
        onChangeText={setPalabra2}
      />

      <Text style={styles.label}>Palabra 3:</Text>
      <TextInput
        style={styles.input}
        value={palabra3}
        onChangeText={setPalabra3}
      />

      <Text style={styles.sectionTitle}>Evaluación</Text>

      <View style={styles.switchContainer}>
        <Text>Intento 1</Text>
        <Switch
          value={attempts.palabra1}
          onValueChange={() => toggleAttempt("palabra1")}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text>Intento 2</Text>
        <Switch
          value={attempts.palabra2}
          onValueChange={() => toggleAttempt("palabra2")}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text>Intento 3</Text>
        <Switch
          value={attempts.palabra3}
          onValueChange={() => toggleAttempt("palabra3")}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text>Dibujo de Reloj</Text>
        <Switch
          value={attempts.dibujoReloj}
          onValueChange={() => toggleAttempt("dibujoReloj")}
        />
      </View>

      <Text style={styles.points}>
        Puntos Totales: {calcularPuntos()}
      </Text>

      <View style={{ marginTop: 20 }}>
        <Button
          title="Enviar Evaluación"
          onPress={handleEnviar}
          color="#841584"
        />
      </View>
    </ScrollView>
  );
};

export default MiniCogScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "purple",
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  points: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
  },
});