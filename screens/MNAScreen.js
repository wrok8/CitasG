import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Accelerometer } from "expo-sensors";

export default function MNAScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const quizData = [
    {
      id: "p1",
      question:
        "1. ¿Ha comido menos por falta de apetito, problemas digestivos, dificultades de masticación o deglución en los últimos 3 meses?",
      options: [
        { id: "1a", label: "Ha comido mucho menos", value: 0 },
        { id: "1b", label: "Ha comido menos", value: 1 },
        { id: "1c", label: "Igual o mucho más", value: 2 },
      ],
    },
    {
      id: "p2",
      question:
        "2. ¿Ha tenido pérdida reciente de peso en los últimos tres meses?",
      options: [
        { id: "2a", label: "Pérdida mayor a 3 kilos", value: 0 },
        { id: "2b", label: "No lo sabe", value: 1 },
        { id: "2c", label: "Pérdida entre 1 y 3 kilos", value: 2 },
        { id: "2d", label: "No ha perdido peso", value: 3 },
      ],
    },
    {
      id: "p3",
      question: "3. Movilidad",
      options: [
        { id: "3a", label: "De la cama al sillón", value: 0 },
        { id: "3b", label: "Autonomía en el interior", value: 1 },
        { id: "3c", label: "Sale del domicilio", value: 2 },
      ],
    },
    {
      id: "p4",
      question:
        "4. ¿Ha tenido enfermedad aguda o estrés psicológico en los últimos 3 meses?",
      options: [
        { id: "4a", label: "Sí", value: 0 },
        { id: "4b", label: "No", value: 2 },
      ],
    },
    {
      id: "p5",
      question: "5. Problemas neuropsicológicos",
      options: [
        { id: "5a", label: "Demencia o depresión grave", value: 0 },
        { id: "5b", label: "Demencia moderada", value: 1 },
        { id: "5c", label: "Sin problemas", value: 2 },
      ],
    },
    {
      id: "p6",
      question: "6. Índice de Masa Corporal (IMC)",
      options: [
        { id: "6a", label: "Menor a 19", value: 0 },
        { id: "6b", label: "19 a <21", value: 1 },
        { id: "6c", label: "21 a <23", value: 2 },
        { id: "6d", label: "≥ 23", value: 3 },
      ],
    },
  ];

  const [answers, setAnswers] = useState({});
  const [peso, setPeso] = useState("");
  const [estatura, setEstatura] = useState("");

  const imcCalculado = useMemo(() => {
    const p = parseFloat(peso);
    const e = parseFloat(estatura);
    if (p > 0 && e > 0) return (p / (e * e)).toFixed(2);
    return null;
  }, [peso, estatura]);

  // SENSOR DE MOVIMIENTO
  useEffect(() => {
    let ultimaSacudida = 0;

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const fuerza = Math.sqrt(x * x + y * y + z * z);

      const ahora = Date.now();

      if (fuerza > 1.8 && ahora - ultimaSacudida > 1500) {
        ultimaSacudida = ahora;

        setAnswers({});
        setPeso("");
        setEstatura("");

        Alert.alert(
          "Respuestas limpiadas",
          "Se reinició la evaluación por movimiento"
        );
      }
    });

    Accelerometer.setUpdateInterval(300);

    return () => subscription.remove();
  }, []);

  const seleccionar = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const calcularResultado = () => {
    if (Object.keys(answers).length !== quizData.length) {
      Alert.alert("Atención", "Responde todas las preguntas");
      return;
    }

    if (!pacienteActual) {
      Alert.alert("Error", "No hay paciente seleccionado");
      return;
    }

    let total = 0;

    quizData.forEach((q) => {
      const opcion = q.options.find((o) => o.id === answers[q.id]);
      if (opcion) total += opcion.value;
    });

    let diagnostico = "";
    if (total >= 12) diagnostico = "Estado nutricional normal";
    else if (total >= 8) diagnostico = "Riesgo de malnutrición";
    else diagnostico = "Malnutrición";

    const nuevaEvaluacion = {
      tipo: "MNA",
      fecha: new Date().toLocaleDateString(),
      puntaje: total,
      detalle: {
        respuestas: answers,
        imc: imcCalculado,
        peso,
        estatura,
        diagnostico,
      },
    };

    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), nuevaEvaluacion],
    }));

    Alert.alert(
      "Prueba Guardada",
      `Puntaje: ${total}\n${diagnostico}`
    );

    setScreen("Agendar Cita");
  };

  const isFinished = Object.keys(answers).length === quizData.length;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Evaluación MNA</Text>

      <Text style={styles.sensorInfo}>
        Sacude el dispositivo para limpiar respuestas
      </Text>

      {quizData.map((item, index) => (
        <View key={item.id}>
          {index === 5 && (
            <View style={styles.imcCard}>
              <Text style={styles.imcTitle}>Calcular IMC</Text>

              <View style={styles.row}>
                <View style={styles.inputGroup}>
                  <Text>Peso (kg)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={peso}
                    onChangeText={setPeso}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text>Estatura (m)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={estatura}
                    onChangeText={setEstatura}
                  />
                </View>
              </View>

              {imcCalculado && (
                <Text style={styles.imcResult}>
                  IMC: {imcCalculado}
                </Text>
              )}
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.question}>{item.question}</Text>

            {item.options.map((option) => {
              const isSelected = answers[item.id] === option.id;

              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    isSelected && styles.selected,
                  ]}
                  onPress={() =>
                    seleccionar(item.id, option.id)
                  }
                >
                  <Text
                    style={
                      isSelected
                        ? styles.selectedText
                        : styles.optionText
                    }
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[
          styles.button,
          !isFinished && styles.buttonDisabled,
        ]}
        disabled={!isFinished}
        onPress={calcularResultado}
      >
        <Text style={styles.buttonText}>
          Guardar Prueba
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8", padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#0D47A1",
  },
  sensorInfo: {
    textAlign: "center",
    marginBottom: 15,
    color: "#C62828",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },
  question: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  option: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  selected: {
    backgroundColor: "#1565C0",
    borderColor: "#1565C0",
  },
  optionText: { color: "black" },
  selectedText: { color: "white", fontWeight: "bold" },
  imcCard: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  imcTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1565C0",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  inputGroup: { width: "48%" },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 5,
  },
  imcResult: {
    marginTop: 10,
    fontWeight: "bold",
    color: "#1565C0",
  },
  button: {
    backgroundColor: "#2E7D32",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonDisabled: { backgroundColor: "#A2A2A2" },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});