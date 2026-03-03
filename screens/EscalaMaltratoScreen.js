import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";

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

  const seleccionar = (preguntaIndex, columna, valor) => {
    setRespuestas({
      ...respuestas,
      [preguntaIndex]: {
        ...respuestas[preguntaIndex],
        [columna]: valor,
      },
    });
  };

  const calcularTotal = () => {
    let total = 0;
    Object.values(respuestas).forEach((r) => {
      if (r?.A === 1) total++;
    });
    return total;
  };

  const guardarDatos = () => {
    if (!pacienteActual) {
      Alert.alert("Error", "No hay paciente seleccionado");
      return;
    }

    if (Object.keys(respuestas).length !== preguntas.length) {
      Alert.alert("Error", "Debe responder todas las preguntas en columna A");
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
      detalle: [
        "Total respuestas afirmativas (Sí): " + total,
        "Interpretación: " + interpretacion,
      ],
    };

    const pruebasActualizadas = Array.isArray(pacienteActual.pruebas)
      ? [...pacienteActual.pruebas, nuevaPrueba]
      : [nuevaPrueba];

    const pacienteActualizado = {
      ...pacienteActual,
      pruebas: pruebasActualizadas,
    };

    setPacienteActual(pacienteActualizado);

    Alert.alert(
      "Evaluación Guardada",
      "Total: " + total + "\n" + interpretacion
    );

    setScreen("Resumen");
  };

  const columnasA = [
    { label: "No", value: 0 },
    { label: "Sí", value: 1 },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Escala Geriátrica de Maltrato</Text>

      {preguntas.map((pregunta, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.pregunta}>
            {index + 1}. {pregunta}
          </Text>

          <View style={styles.opciones}>
            {columnasA.map((op, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.option,
                  respuestas[index]?.A === op.value && styles.selected,
                ]}
                onPress={() => seleccionar(index, "A", op.value)}
              >
                <Text>{op.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <Text style={styles.total}>
        Total (Sí): {calcularTotal()} / 22
      </Text>

      <TouchableOpacity style={styles.button} onPress={guardarDatos}>
        <Text style={styles.buttonText}>Guardar Evaluación</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  row: {
    marginBottom: 15,
  },
  pregunta: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  opciones: {
    flexDirection: "row",
  },
  option: {
    padding: 8,
    marginRight: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
  },
  selected: {
    backgroundColor: "#90caf9",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});