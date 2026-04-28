import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Accelerometer } from "expo-sensors";

export default function SarcFScreen({
  pacienteActual,
  setPacienteActual,
  pacientes,
  setPacientes,
  setScreen,
}) {
  const [respuestas, setRespuestas] = useState({
    fuerza: null,
    caminar: null,
    silla: null,
    escaleras: null,
    caidas: null,
  });

  const lastShake = useRef(0);

  // 🔥 SENSOR DE AGITADO
  useEffect(() => {
    Accelerometer.setUpdateInterval(300);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitud = Math.sqrt(x * x + y * y + z * z);

      if (magnitud > 1.8) {
        const now = Date.now();

        if (now - lastShake.current > 1500) {
          lastShake.current = now;

          Alert.alert(
            "Borrar respuestas",
            "¿Deseas reiniciar la evaluación?",
            [
              {
                text: "Cancelar",
                style: "cancel",
              },
              {
                text: "Sí, borrar",
                onPress: () => reiniciarFormulario(),
              },
            ]
          );
        }
      }
    });

    return () => subscription.remove();
  }, []);

  const reiniciarFormulario = () => {
    setRespuestas({
      fuerza: null,
      caminar: null,
      silla: null,
      escaleras: null,
      caidas: null,
    });

    Alert.alert("Reiniciado", "Las respuestas fueron borradas");
  };

  const seleccionar = (campo, valor) => {
    setRespuestas((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const calcularPuntaje = () => {
    return Object.values(respuestas).reduce(
      (total, valor) => total + valor,
      0
    );
  };

  const guardarDatos = () => {
    if (!pacienteActual) {
      Alert.alert("Error", "No hay paciente seleccionado");
      return;
    }

    if (Object.values(respuestas).includes(null)) {
      Alert.alert("Error", "Contesta todas las preguntas");
      return;
    }

    const puntaje = calcularPuntaje();

    const interpretacion =
      puntaje >= 4
        ? "Alta probabilidad de sarcopenia"
        : "Baja probabilidad de sarcopenia";

    const nuevaPrueba = {
      tipo: "SARC-F",
      fecha: new Date().toLocaleDateString(),
      puntaje: puntaje,
      maximo: 10,
      detalle: {
        respuestas,
        interpretacion,
      },
    };

    const pacienteActualizado = {
      ...pacienteActual,
      pruebas: [...(pacienteActual?.pruebas || []), nuevaPrueba],
    };

    setPacienteActual(pacienteActualizado);

    if (pacientes && setPacientes) {
      const pacientesActualizados = pacientes.map((p) =>
        p.id === pacienteActual.id ? pacienteActualizado : p
      );

      setPacientes(pacientesActualizados);
    }

    Alert.alert(
      "SARC-F Guardado",
      `Puntaje: ${puntaje}/10\n${interpretacion}`,
      [
        {
          text: "OK",
          onPress: () => setScreen("Agendar Cita"),
        },
      ]
    );
  };

  function botones(campo) {
    return (
      <View style={styles.opciones}>
        {[0, 1, 2].map((valor) => (
          <TouchableOpacity
            key={valor}
            style={[
              styles.boton,
              respuestas[campo] === valor &&
                styles.botonActivo,
            ]}
            onPress={() => seleccionar(campo, valor)}
          >
            <Text
              style={[
                styles.textoBoton,
                respuestas[campo] === valor &&
                  styles.textoActivo,
              ]}
            >
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Evaluación SARC-F</Text>

      <Text style={styles.sensorInfo}>
        📳 Agita el dispositivo para borrar respuestas
      </Text>

      {pacienteActual?.nombre && (
        <View style={styles.bannerPaciente}>
          <Text style={styles.textoPaciente}>
            👤 Paciente: {pacienteActual.nombre}
          </Text>
        </View>
      )}

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

      <TouchableOpacity
        style={styles.botonGuardar}
        onPress={guardarDatos}
      >
        <Text style={styles.textoGuardar}>
          Guardar Resultado
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4F6F8",
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0D47A1",
    textAlign: "center",
  },

  sensorInfo: {
    textAlign: "center",
    marginBottom: 15,
    color: "#666",
    fontStyle: "italic",
  },

  bannerPaciente: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  textoPaciente: {
    fontWeight: "bold",
    color: "#0D47A1",
    textAlign: "center",
  },

  pregunta: {
    marginTop: 15,
    fontWeight: "bold",
    fontSize: 15,
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

  textoActivo: {
    color: "white",
    fontWeight: "bold",
  },

  botonGuardar: {
    marginTop: 25,
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },

  textoGuardar: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});