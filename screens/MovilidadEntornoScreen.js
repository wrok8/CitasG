import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { EvaluationContext } from "../context/EvaluationContext";

export default function MovilidadEntornoScreen({ setScreen }) {

  const { actualizarDatosCita } = useContext(EvaluationContext);

  const preguntas = [
    "En su hogar existe espacio suficiente para permitir su libre movilidad",
    "Su vivienda está adaptada para persona mayor",
    "Su vivienda es idónea según su condición de salud",
    "El equipamiento para modificar su vivienda está disponible",
    "Puede cambiar a una vivienda mejor adaptada",
    "Puede trasladarse sin problemas fuera del hogar",
    "El camino peatonal está libre de obstrucciones",
    "Las aceras tienen correcto mantenimiento",
    "Las aceras están libres de obstrucciones",
    "Las normas de tránsito se respetan",
    "Edificios públicos accesibles",
    "Realiza actividad física",
    "Su salud le permite actividad física",
    "Su comunidad es segura para actividad física",
    "Transporte público accesible",
    "Transporte confiable y frecuente",
    "Rutas adecuadas",
    "Vehículos accesibles según su condición",
    "Paradas adecuadas",
    "Camiones en buen estado",
  ];

  const [respuestas, setRespuestas] = useState(
    Array(preguntas.length).fill(null)
  );

  const seleccionar = (index, valor) => {
    const nuevas = [...respuestas];
    nuevas[index] = valor;
    setRespuestas(nuevas);
  };

  const calcularResultado = () => {
    const positivas = respuestas.filter((r) => r === true).length;
    const negativas = respuestas.filter((r) => r === false).length;

    let riesgo = "Bajo";

    if (negativas >= 7) riesgo = "Alto";
    else if (negativas >= 4) riesgo = "Moderado";

    return { positivas, negativas, riesgo };
  };

  const guardarEvaluacion = () => {
    if (respuestas.includes(null)) {
      Alert.alert("Error", "Debe responder todas las preguntas");
      return;
    }

    const { positivas, negativas, riesgo } = calcularResultado();

    // 🔥 GUARDAR CORRECTO (igual que las otras pruebas)
    actualizarDatosCita({
      evaluacionesResultados: {
        MovilidadEntorno: {
          nombre: "Movilidad en el Entorno",
          puntaje: negativas,
          puntajeMax: preguntas.length,
          interpretacion: `Positivas: ${positivas}, Negativas: ${negativas}, Riesgo: ${riesgo}`,
        },
      },
    });

    Alert.alert(
      "Evaluación Guardada",
      `Riesgo: ${riesgo}`
    );

    setScreen("Agendar Cita");
  };

  const { positivas, negativas, riesgo } = calcularResultado();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Movilidad en el Entorno</Text>

      {preguntas.map((pregunta, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.pregunta}>
            {index + 1}. {pregunta}
          </Text>

          <View style={styles.opciones}>
            <TouchableOpacity
              style={[
                styles.option,
                respuestas[index] === true && styles.selected,
              ]}
              onPress={() => seleccionar(index, true)}
            >
              <Text>Sí</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                respuestas[index] === false && styles.selected,
              ]}
              onPress={() => seleccionar(index, false)}
            >
              <Text>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={styles.resultado}>
        Positivas: {positivas} | Negativas: {negativas}
      </Text>

      <Text style={styles.riesgo}>
        Nivel de Riesgo: {riesgo}
      </Text>

      <TouchableOpacity style={styles.button} onPress={guardarEvaluacion}>
        <Text style={styles.buttonText}>Guardar Evaluación</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  row: { marginBottom: 15 },
  pregunta: { fontWeight: "bold", marginBottom: 5 },
  opciones: { flexDirection: "row" },
  option: {
    padding: 8,
    marginRight: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
  },
  selected: {
    backgroundColor: "#90caf9",
  },
  resultado: {
    fontSize: 16,
    marginTop: 20,
  },
  riesgo: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
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