import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Accelerometer } from "expo-sensors";

const PREGUNTAS = [
  { id: 1, texto: "1. ¿En general, está satisfecho(a) con su vida?", valorPositivo: "No" },
  { id: 2, texto: "2. ¿Ha abandonado muchas tareas y aficiones?", valorPositivo: "Sí" },
  { id: 3, texto: "3. ¿Siente que su vida está vacía?", valorPositivo: "Sí" },
  { id: 4, texto: "4. ¿Se siente con frecuencia aburrido(a)?", valorPositivo: "Sí" },
  { id: 5, texto: "5. ¿Se encuentra de buen humor la mayor parte del tiempo?", valorPositivo: "No" },
  { id: 6, texto: "6. ¿Teme que algo malo pueda ocurrirle?", valorPositivo: "Sí" },
  { id: 7, texto: "7. ¿Se siente feliz la mayor parte del tiempo?", valorPositivo: "No" },
  { id: 8, texto: "8. ¿Se siente desamparado(a)?", valorPositivo: "Sí" },
  { id: 9, texto: "9. ¿Prefiere quedarse en casa?", valorPositivo: "Sí" },
  { id: 10, texto: "10. ¿Tiene más problemas de memoria?", valorPositivo: "Sí" },
  { id: 11, texto: "11. ¿Es estupendo estar vivo(a)?", valorPositivo: "No" },
  { id: 12, texto: "12. ¿Se siente inútil?", valorPositivo: "Sí" },
  { id: 13, texto: "13. ¿Se siente lleno(a) de energía?", valorPositivo: "No" },
  { id: 14, texto: "14. ¿Se siente sin esperanza?", valorPositivo: "Sí" },
  { id: 15, texto: "15. ¿La mayoría está en mejor situación que usted?", valorPositivo: "Sí" },
];

export default function GDS15Screen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const [respuestas, setRespuestas] = useState({});

  const shakeTimeout = useRef(null);

  const seleccionarRespuesta = (id, respuesta) => {
    setRespuestas({ ...respuestas, [id]: respuesta });
  };

  // FUNCIÓN PARA LIMPIAR RESPUESTAS
  const limpiarFormulario = () => {
    setRespuestas({});
    Alert.alert(
      "Formulario reiniciado",
      "Se limpiaron todas las respuestas 📱"
    );
  };

  // SENSOR DE SACUDIDA
  useEffect(() => {
    Accelerometer.setUpdateInterval(300);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.sqrt(x * x + y * y + z * z);

      if (totalForce > 1.8) {
        if (!shakeTimeout.current) {
          limpiarFormulario();

          shakeTimeout.current = setTimeout(() => {
            shakeTimeout.current = null;
          }, 2000);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  const finalizarEvaluacion = () => {
    if (Object.keys(respuestas).length < 15) {
      Alert.alert("Incompleto", "Responda todas las preguntas.");
      return;
    }

    let puntaje = 0;

    PREGUNTAS.forEach((pregunta) => {
      if (respuestas[pregunta.id] === pregunta.valorPositivo) {
        puntaje++;
      }
    });

    let interpretacion = "";
    if (puntaje <= 4) interpretacion = "Normal";
    else if (puntaje <= 8) interpretacion = "Depresión leve";
    else if (puntaje <= 11) interpretacion = "Depresión moderada";
    else interpretacion = "Depresión severa";

    if (!pacienteActual) {
      Alert.alert("Error", "No hay paciente seleccionado");
      return;
    }

    const nuevaEvaluacion = {
      tipo: "GDS-15",
      fecha: new Date().toLocaleDateString(),
      puntaje: puntaje,
      detalle: {
        respuestas,
        interpretacion,
      },
    };

    // MISMO SISTEMA QUE FLUENCIA VERBAL
    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), nuevaEvaluacion],
    }));

    Alert.alert(
      "Evaluación completada",
      `Puntaje: ${puntaje}/15\n${interpretacion}`
    );

    setScreen("Agendar Cita");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>GDS-15</Text>

      {PREGUNTAS.map((pregunta) => (
        <View key={pregunta.id} style={styles.card}>
          <Text style={styles.texto}>{pregunta.texto}</Text>

          <View style={styles.row}>
            {["Sí", "No"].map((op) => (
              <Pressable
                key={op}
                style={[
                  styles.boton,
                  respuestas[pregunta.id] === op && styles.selected,
                ]}
                onPress={() =>
                  seleccionarRespuesta(pregunta.id, op)
                }
              >
                <Text
                  style={{
                    color:
                      respuestas[pregunta.id] === op
                        ? "white"
                        : "black",
                  }}
                >
                  {op}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Pressable
        style={styles.finalizar}
        onPress={finalizarEvaluacion}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
          }}
        >
          Finalizar Evaluación
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F3F4F6",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  texto: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  boton: {
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
  finalizar: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
});