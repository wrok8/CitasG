import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import { EvaluationContext } from "../context/EvaluationContext";

export default function SarcFScreen({
  pacienteActual,
  setPacienteActual,
  setScreen,
}) {
  const { guardarResultadoPrueba } = useContext(EvaluationContext);

  const [respuestas, setRespuestas] = useState({
    fuerza: null,
    caminar: null,
    silla: null,
    escaleras: null,
    caidas: null,
  });

  // 🔥 SENSOR PARA REINICIAR
  useEffect(() => {
    let lastShake = 0;

    const subscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const total = Math.abs(x) + Math.abs(y) + Math.abs(z);

      if (total > 2.2) {
        const now = Date.now();
        if (now - lastShake > 1500) {
          lastShake = now;

          setRespuestas({
            fuerza: null,
            caminar: null,
            silla: null,
            escaleras: null,
            caidas: null,
          });

          Alert.alert(
            "Reinicio",
            "La prueba fue reiniciada por movimiento del dispositivo"
          );
        }
      }
    });

    Accelerometer.setUpdateInterval(300);

    return () => subscription.remove();
  }, []);

  const seleccionar = (campo, valor) => {
    setRespuestas({ ...respuestas, [campo]: valor });
  };

  const calcularPuntaje = () => {
    return Object.values(respuestas).reduce((sum, val) => sum + val, 0);
  };

  const guardarDatos = () => {
    if (Object.values(respuestas).includes(null)) {
      Alert.alert("Error", "Contesta todas las preguntas");
      return;
    }

    const puntaje = calcularPuntaje();

    const interpretacion =
      puntaje >= 4
        ? "Alta probabilidad de sarcopenia"
        : "Baja probabilidad de sarcopenia";

    // 🔥 FORMATO CORRECTO PARA TU SISTEMA
    const resultado = {
      nombre: "SARC-F",
      puntaje: puntaje,
      puntajeMax: 10,
      interpretacion: interpretacion,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      detalles: respuestas,
    };


    guardarResultadoPrueba("SARC-F", resultado);


    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), resultado],
    }));

    Alert.alert(
      "SARC-F Guardado",
      `Puntaje: ${puntaje}\n${interpretacion}`
    );

    setScreen("Agendar Cita");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Evaluación SARC-F</Text>

      <Text style={styles.pregunta}>
        1. ¿Qué tanta dificultad tiene para levantar 4-5 kg?
      </Text>
      {botones("fuerza")}

      <Text style={styles.pregunta}>
        2. ¿Qué tanta dificultad tiene para caminar?
      </Text>
      {botones("caminar")}

      <Text style={styles.pregunta}>
        3. ¿Qué tanta dificultad tiene para levantarse de una silla?
      </Text>
      {botones("silla")}

      <Text style={styles.pregunta}>
        4. ¿Qué tanta dificultad tiene para subir escaleras?
      </Text>
      {botones("escaleras")}

      <Text style={styles.pregunta}>
        5. ¿Cuántas caídas ha tenido en el último año?
      </Text>
      {botones("caidas")}

      <TouchableOpacity style={styles.botonGuardar} onPress={guardarDatos}>
        <Text style={styles.textoGuardar}>Guardar Resultado</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  function botones(campo) {
    return (
      <View style={styles.opciones}>
        {[0, 1, 2].map((valor) => (
          <TouchableOpacity
            key={valor}
            style={[
              styles.boton,
              respuestas[campo] === valor && styles.botonActivo,
            ]}
            onPress={() => seleccionar(campo, valor)}
          >
            <Text style={styles.textoBoton}>
              {valor === 0
                ? "Ninguna"
                : valor === 1
                ? "Alguna"
                : "Mucha / Incapaz"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0D47A1",
  },

  pregunta: {
    marginTop: 15,
    fontWeight: "bold",
  },

  opciones: {
    marginVertical: 8,
  },

  boton: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 10,
    marginVertical: 4,
  },

  botonActivo: {
    backgroundColor: "#1565C0",
  },

  textoBoton: {
    textAlign: "center",
    color: "black",
  },

  botonGuardar: {
    marginTop: 25,
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 12,
  },

  textoGuardar: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});