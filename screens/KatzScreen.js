import React, { useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { EvaluationContext } from "../context/EvaluationContext";

export default function KatzScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const { guardarResultadoPrueba } = useContext(EvaluationContext);

  const [answers, setAnswers] = useState({
    bath: null,
    dress: null,
    toilet: null,
    transfer: null,
    continence: null,
    feeding: null,
  });

  const seleccionar = (campo, valor) => {
    setAnswers((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const obtenerInterpretacion = (puntaje) => {
    if (puntaje === 6) return "Independiente";
    if (puntaje >= 4) return "Dependencia leve";
    if (puntaje >= 2) return "Dependencia moderada";
    return "Dependencia severa";
  };

  const guardarPrueba = () => {
    if (Object.values(answers).includes(null)) {
      Alert.alert("Atención", "Responde todas las preguntas.");
      return;
    }

    const puntaje = Object.values(answers).filter(
      (val) => val === "si"
    ).length;

    const interpretacion = obtenerInterpretacion(puntaje);

    const resultado = {
      nombre: "Katz",
      puntaje: puntaje,
      puntajeMax: 6,
      interpretacion: interpretacion,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      detalles: {
        respuestas: answers,
      },
    };

    guardarResultadoPrueba("Katz", resultado);

    if (pacienteActual) {
      const nuevaEvaluacion = {
        tipo: "Índice de Katz",
        fecha: new Date().toLocaleDateString(),
        puntaje: puntaje,
        detalle: {
          respuestas: answers,
          interpretacion,
        },
      };

      setPacienteActual((prev) => ({
        ...prev,
        pruebas: [...(prev?.pruebas || []), nuevaEvaluacion],
      }));
    }

    Alert.alert(
      "✅ Prueba Guardada",
      `Puntaje: ${puntaje}/6\n${interpretacion}`
    );

    setScreen("Agendar Cita");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Índice de Katz</Text>

      <View style={styles.card}>
        <Text style={styles.pregunta}>
          1) Baño (Esponja, regadera o tina)
        </Text>
        <Text style={styles.descripcion}>
          Sí: No recibe asistencia (puede entrar y salir de la tina u otra forma de baño).{"\n"}
          Sí: Recibe asistencia durante el baño en una sola parte del cuerpo (ej. espalda o pierna).{"\n"}
          No: Recibe asistencia durante el baño en más de una parte.
        </Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.opcion, answers.bath === "si" && styles.selected]}
            onPress={() => seleccionar("bath", "si")}
          >
            <Text style={answers.bath === "si" ? styles.selectedText : styles.text}>
              Sí
            </Text>
          </Pressable>
          <Pressable
            style={[styles.opcion, answers.bath === "no" && styles.selected]}
            onPress={() => seleccionar("bath", "no")}
          >
            <Text style={answers.bath === "no" ? styles.selectedText : styles.text}>
              No
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.pregunta}>2) Vestido</Text>
        <Text style={styles.descripcion}>
          Sí: Puede tomar las prendas y vestirse completamente sin asistencia.{"\n"}
          Sí: Puede vestirse excepto abrocharse los zapatos.{"\n"}
          No: Recibe asistencia para vestirse.
        </Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.opcion, answers.dress === "si" && styles.selected]}
            onPress={() => seleccionar("dress", "si")}
          >
            <Text style={answers.dress === "si" ? styles.selectedText : styles.text}>
              Sí
            </Text>
          </Pressable>
          <Pressable
            style={[styles.opcion, answers.dress === "no" && styles.selected]}
            onPress={() => seleccionar("dress", "no")}
          >
            <Text style={answers.dress === "no" ? styles.selectedText : styles.text}>
              No
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.pregunta}>3) Uso del Sanitario</Text>
        <Text style={styles.descripcion}>
          Sí: Sin asistencia (puede usar bastón o silla de ruedas).{"\n"}
          Sí: Recibe asistencia pero maneja su pañal o cómodo.{"\n"}
          No: No va al baño por sí mismo.
        </Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.opcion, answers.toilet === "si" && styles.selected]}
            onPress={() => seleccionar("toilet", "si")}
          >
            <Text style={answers.toilet === "si" ? styles.selectedText : styles.text}>
              Sí
            </Text>
          </Pressable>
          <Pressable
            style={[styles.opcion, answers.toilet === "no" && styles.selected]}
            onPress={() => seleccionar("toilet", "no")}
          >
            <Text style={answers.toilet === "no" ? styles.selectedText : styles.text}>
              No
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.pregunta}>4) Transferencias</Text>
        <Text style={styles.descripcion}>
          Sí: Se mueve dentro y fuera de la cama y silla sin asistencia.{"\n"}
          Sí: Se mueve con asistencia.{"\n"}
          No: No puede salir de la cama.
        </Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.opcion, answers.transfer === "si" && styles.selected]}
            onPress={() => seleccionar("transfer", "si")}
          >
            <Text style={answers.transfer === "si" ? styles.selectedText : styles.text}>
              Sí
            </Text>
          </Pressable>
          <Pressable
            style={[styles.opcion, answers.transfer === "no" && styles.selected]}
            onPress={() => seleccionar("transfer", "no")}
          >
            <Text style={answers.transfer === "no" ? styles.selectedText : styles.text}>
              No
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.pregunta}>5) Continencia</Text>
        <Text style={styles.descripcion}>
          Sí: Control total de esfínteres.{"\n"}
          Sí: Accidentes ocasionales.{"\n"}
          No: Necesita ayuda o es incontinente.
        </Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.opcion, answers.continence === "si" && styles.selected]}
            onPress={() => seleccionar("continence", "si")}
          >
            <Text style={answers.continence === "si" ? styles.selectedText : styles.text}>
              Sí
            </Text>
          </Pressable>
          <Pressable
            style={[styles.opcion, answers.continence === "no" && styles.selected]}
            onPress={() => seleccionar("continence", "no")}
          >
            <Text style={answers.continence === "no" ? styles.selectedText : styles.text}>
              No
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.pregunta}>6) Alimentación</Text>
        <Text style={styles.descripcion}>
          Sí: Se alimenta solo sin asistencia.{"\n"}
          Sí: Necesita ayuda para cortar carne o untar mantequilla.{"\n"}
          No: Recibe asistencia o alimentación enteral/parenteral.
        </Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.opcion, answers.feeding === "si" && styles.selected]}
            onPress={() => seleccionar("feeding", "si")}
          >
            <Text style={answers.feeding === "si" ? styles.selectedText : styles.text}>
              Sí
            </Text>
          </Pressable>
          <Pressable
            style={[styles.opcion, answers.feeding === "no" && styles.selected]}
            onPress={() => seleccionar("feeding", "no")}
          >
            <Text style={answers.feeding === "no" ? styles.selectedText : styles.text}>
              No
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.botonGuardar} onPress={guardarPrueba}>
        <Text style={styles.botonTexto}>Guardar Prueba</Text>
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
    marginBottom: 20,
    textAlign: "center",
    color: "#0D47A1",
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
    marginBottom: 5,
  },
  descripcion: {
    fontSize: 13,
    color: "#555",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  opcion: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#1565C0",
    borderColor: "#1565C0",
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