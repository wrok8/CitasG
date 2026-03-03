import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  TextInput,
} from "react-native";

export default function AudicionScreen({ setScreen, pacienteActual, setPacienteActual }) {
  const [respuestas, setRespuestas] = useState([]);
  const [input, setInput] = useState("");
  const [activo, setActivo] = useState(false);
  const [preguntaIndex, setPreguntaIndex] = useState(0);

  const preguntas = [
    "¿Puede oír mi voz claramente?",
    "¿Escucha sonidos suaves alrededor suyo?",
    "¿Ha tenido dificultad para entender conversaciones en ambientes ruidosos?",
    "¿Usa algún aparato auditivo?",
    "¿Siente zumbido en los oídos?"
  ];

  // ▶ Iniciar prueba
  const iniciarPrueba = () => {
    setRespuestas([]);
    setPreguntaIndex(0);
    setActivo(true);
  };

  // ➕ Guardar respuesta y pasar a siguiente
  const siguientePregunta = () => {
    if (input.trim() === "") {
      Alert.alert("Atención", "Por favor escriba una respuesta");
      return;
    }

    setRespuestas([...respuestas, input.trim()]);
    setInput("");

    if (preguntaIndex + 1 < preguntas.length) {
      setPreguntaIndex(preguntaIndex + 1);
    } else {
      finalizarPrueba();
    }
  };

  // ⏹ Finalizar prueba
  const finalizarPrueba = () => {
    setActivo(false);

    if (!pacienteActual) {
      Alert.alert("Error", "No hay paciente seleccionado");
      return;
    }

    const nuevaEvaluacion = {
      tipo: "Audición",
      fecha: new Date().toLocaleDateString(),
      detalle: respuestas,
    };

    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), nuevaEvaluacion],
    }));

    Alert.alert(
      "Prueba Finalizada",
      `Se registraron ${respuestas.length} respuestas`
    );

    setScreen("Agendar Cita"); // regresa a RegisterPatientScreen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Prueba de Audición</Text>

      {!activo ? (
        <TouchableOpacity style={styles.botonIniciar} onPress={iniciarPrueba}>
          <Text style={styles.botonTexto}>Iniciar Prueba</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.pregunta}>
            {preguntas[preguntaIndex]}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Escriba su respuesta..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={siguientePregunta}
          />

          <TouchableOpacity style={styles.botonSiguiente} onPress={siguientePregunta}>
            <Text style={styles.botonTexto}>
              {preguntaIndex + 1 === preguntas.length ? "Finalizar" : "Siguiente"}
            </Text>
          </TouchableOpacity>

          <FlatList
            data={respuestas}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <Text style={styles.item}>
                {index + 1}. {item}
              </Text>
            )}
            style={styles.lista}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f6f8" },
  titulo: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#0D47A1" },
  pregunta: { fontSize: 18, marginVertical: 15, fontWeight: "bold" },
  input: { backgroundColor: "white", padding: 12, borderRadius: 8, marginBottom: 10, elevation: 2 },
  botonIniciar: { backgroundColor: "#2E7D32", padding: 15, borderRadius: 10, alignItems: "center" },
  botonSiguiente: { backgroundColor: "#1565C0", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  botonTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
  lista: { marginTop: 15 },
  item: { fontSize: 16, marginVertical: 3 },
});