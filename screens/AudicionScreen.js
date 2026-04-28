import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  TextInput,
} from "react-native";
import { EvaluationContext } from "../context/EvaluationContext";
import { Accelerometer } from "expo-sensors";

export default function AudicionScreen({ setScreen, pacienteActual, setPacienteActual }) {
  const { guardarResultadoPrueba } = useContext(EvaluationContext);

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

  useEffect(() => {
    Accelerometer.setUpdateInterval(300);
    const subscription = Accelerometer.addListener(data => {
      const { x, y, z } = data;
      const aceleracion = Math.sqrt(x * x + y * y + z * z);

      if (aceleracion > 2.2) {
        resetearPrueba();
      }
    });

    return () => subscription && subscription.remove();
  }, [respuestas, activo, preguntaIndex]);

  const resetearPrueba = () => {
    setRespuestas([]);
    setInput("");
    setPreguntaIndex(0);
    setActivo(false);
    Alert.alert("Reinicio", "La prueba ha sido reiniciada por sacudir el dispositivo");
  };

  const iniciarPrueba = () => {
    setRespuestas([]);
    setPreguntaIndex(0);
    setActivo(true);
  };

  const siguientePregunta = () => {
    if (input.trim() === "") {
      Alert.alert("Atención", "Por favor escriba una respuesta");
      return;
    }

    setRespuestas(prev => [...prev, input.trim()]);
    setInput("");

    if (preguntaIndex + 1 < preguntas.length) {
      setPreguntaIndex(preguntaIndex + 1);
    } else {
      finalizarPrueba([...respuestas, input.trim()]);
    }
  };

  const calcularPuntaje = (resps) => {
    let puntos = 0;
    resps.forEach(r => {
      const txt = r.toLowerCase();
      if (txt.includes("no") || txt.includes("dificultad") || txt.includes("zumbido")) {
        puntos += 0;
      } else {
        puntos += 1;
      }
    });
    return puntos;
  };

  const finalizarPrueba = (respsFinales) => {
    setActivo(false);

    const puntaje = calcularPuntaje(respsFinales);

    let interpretacion = "";
    if (puntaje >= 4) interpretacion = "Audición conservada";
    else if (puntaje >= 2) interpretacion = "Posible deterioro auditivo";
    else interpretacion = "Deterioro auditivo significativo";

    const resultado = {
      nombre: "Audición",
      puntaje: puntaje,
      puntajeMax: preguntas.length,
      interpretacion: interpretacion,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      detalles: respsFinales,
    };

    guardarResultadoPrueba("Audicion", resultado);

    const nuevaEvaluacion = {
      tipo: "Audición",
      fecha: new Date().toLocaleDateString(),
      puntaje: puntaje,
      detalle: {
        respuestas: respsFinales,
        interpretacion,
      },
    };

    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), nuevaEvaluacion],
    }));

    Alert.alert(
      "Prueba Finalizada",
      `Puntaje: ${puntaje}/${preguntas.length}\n${interpretacion}`
    );

    setScreen("Agendar Cita");
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