import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

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

  const seleccionar = (campo, valor) => {
    setRespuestas({ ...respuestas, [campo]: valor });
  };

  const calcularPuntaje = () => {
    let total = 0;
    Object.values(respuestas).forEach((valor) => {
      total += valor;
    });
    return total;
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
      detalle: [
        `Interpretación: ${interpretacion}`,
      ],
    };

    const pruebasActualizadas = Array.isArray(
      pacienteActual.pruebas
    )
      ? [...pacienteActual.pruebas, nuevaPrueba]
      : [nuevaPrueba];

    const pacienteActualizado = {
      ...pacienteActual,
      pruebas: pruebasActualizadas,
    };

    // actualizar paciente actual
    setPacienteActual(pacienteActualizado);

    // actualizar lista global de pacientes
    const pacientesActualizados = pacientes.map((p) =>
      p.id === pacienteActual.id
        ? pacienteActualizado
        : p
    );

    setPacientes(pacientesActualizados);

    Alert.alert(
      "SARC-F Guardado",
      `Puntaje: ${puntaje}/10\n${interpretacion}`,
      [
        {
          text: "OK",
          onPress: () => {
            setScreen("Agendar Cita");
          },
        },
      ]
    );
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