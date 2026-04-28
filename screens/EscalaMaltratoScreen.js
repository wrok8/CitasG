import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Accelerometer } from "expo-sensors";

export default function EscalaMaltratoScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const preguntas = [
    "¿Le han golpeado?",
    "¿Le han dado puñetazos o patadas?",
    "¿Le han empujado o jalado el pelo?",
    "¿Le han aventado algún objeto?",
    "¿Le han agredido con cuchillo o navaja?",
    "¿Le han humillado o burlado?",
    "¿Le han tratado con indiferencia?",
    "¿Le han aislado de su familia?",
    "¿Le han hecho sentir miedo?",
    "¿No han respetado sus decisiones?",
    "¿Le han prohibido salir o visitas?",
    "¿Le han dejado sin ropa o calzado?",
    "¿Le han dejado sin medicamentos?",
    "¿Le han negado protección?",
    "¿Le han negado acceso a su casa?",
    "¿Alguien maneja su dinero sin permiso?",
    "¿Le han quitado dinero?",
    "¿Le han tomado bienes sin permiso?",
    "¿Le han vendido propiedad sin consentimiento?",
    "¿Lo han presionado para firmar documentos?",
    "¿Le han exigido relaciones sexuales?",
    "¿Le han tocado sin consentimiento?",
  ];

  const [respuestas, setRespuestas] = useState({});
  const lastShake = useRef(0);

  // 🔥 SENSOR DE AGITADO
  useEffect(() => {
    Accelerometer.setUpdateInterval(300);

    const subscription = Accelerometer.addListener(
      ({ x, y, z }) => {
        const magnitud = Math.sqrt(
          x * x + y * y + z * z
        );

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
                  onPress: reiniciarFormulario,
                },
              ]
            );
          }
        }
      }
    );

    return () => subscription.remove();
  }, []);

  const reiniciarFormulario = () => {
    setRespuestas({});
    Alert.alert(
      "Reiniciado",
      "Las respuestas fueron borradas"
    );
  };

  const seleccionar = (preguntaIndex, valor) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaIndex]: valor,
    }));
  };

  const calcularTotal = () => {
    return Object.values(respuestas).filter(
      (valor) => valor === 1
    ).length;
  };

  const guardarDatos = () => {
    if (!pacienteActual) {
      Alert.alert(
        "Error",
        "No hay paciente seleccionado"
      );
      return;
    }

    if (
      Object.keys(respuestas).length !==
      preguntas.length
    ) {
      Alert.alert(
        "Error",
        "Debe responder todas las preguntas"
      );
      return;
    }

    const total = calcularTotal();

    const interpretacion =
      total > 0
        ? "Existe riesgo o evidencia de maltrato"
        : "No se detectan indicadores de maltrato";

    const nuevaPrueba = {
      tipo: "Escala Geriátrica de Maltrato",
      fecha: new Date().toLocaleDateString(),
      puntaje: total,
      detalle: preguntas.map(
        (pregunta, index) => ({
          pregunta,
          respuesta:
            respuestas[index] === 1
              ? "Sí"
              : "No",
        })
      ),
      interpretacion,
    };

    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [
        ...(prev?.pruebas || []),
        nuevaPrueba,
      ],
    }));

    Alert.alert(
      "Evaluación Guardada",
      `Puntaje: ${total}/22\n${interpretacion}`
    );

    setScreen("Agendar Cita");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>
        Escala Geriátrica de Maltrato
      </Text>

      <Text style={styles.sensorInfo}>
        📳 Agita el dispositivo para borrar respuestas
      </Text>

      {preguntas.map((pregunta, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.pregunta}>
            {index + 1}. {pregunta}
          </Text>

          <View style={styles.opciones}>
            <TouchableOpacity
              style={[
                styles.option,
                respuestas[index] === 0 &&
                  styles.selected,
              ]}
              onPress={() =>
                seleccionar(index, 0)
              }
            >
              <Text
                style={
                  respuestas[index] === 0
                    ? styles.selectedText
                    : null
                }
              >
                No
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                respuestas[index] === 1 &&
                  styles.selected,
              ]}
              onPress={() =>
                seleccionar(index, 1)
              }
            >
              <Text
                style={
                  respuestas[index] === 1
                    ? styles.selectedText
                    : null
                }
              >
                Sí
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={styles.total}>
        Total (Sí): {calcularTotal()} / 22
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={guardarDatos}
      >
        <Text style={styles.buttonText}>
          Guardar Evaluación
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f4f6f8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#0D47A1",
  },
  sensorInfo: {
    textAlign: "center",
    marginBottom: 15,
    color: "#666",
    fontStyle: "italic",
  },
  row: {
    marginBottom: 15,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
  },
  pregunta: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  opciones: {
    flexDirection: "row",
    gap: 10,
  },
  option: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#1565C0",
  },
  selectedText: {
    color: "white",
    fontWeight: "bold",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});