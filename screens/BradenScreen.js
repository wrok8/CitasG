import React, { useState, useContext } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { EvaluationContext } from "../context/EvaluationContext";

const BRADEN_TABLE = [
  {
    criterio: 'Percepción sensoria',
    opciones: [
      '1. Completamente limitada: no reacciona ante estímulos dolorosos.',
      '2. Muy limitada: reacciona solo ante estímulos dolorosos.',
      '3. Ligeramente limitada: reacciona a órdenes verbales pero no siempre comunica molestias.',
      '4. Sin limitaciones: responde a órdenes verbales completamente.',
    ],
    riesgo: '1-2 Con riesgo, 3-4 Sin riesgo'
  },
  {
    criterio: 'Exposición a la humedad',
    opciones: [
      '1. Completamente húmeda: piel constantemente expuesta a humedad.',
      '2. A menudo húmeda: piel a menudo húmeda, ropa de cama requiere cambio.',
      '3. Ocasionalmente húmeda: piel requiere cambio suplementario de ropa.',
      '4. Raramente húmeda: piel generalmente seca, cambios de rutina.',
    ],
    riesgo: '1-2 Con riesgo, 3-4 Sin riesgo'
  },
  {
    criterio: 'Actividad',
    opciones: [
      '1. Encamado/a: paciente constantemente encamado.',
      '2. En silla: no puede andar, necesita ayuda para silla o silla de ruedas.',
      '3. Deambula ocasionalmente: distancias muy cortas, la mayor parte en cama o silla.',
      '4. Deambula frecuentemente: fuera de la habitación al menos 2 horas.',
    ],
    riesgo: '1-2 Con riesgo, 3-4 Sin riesgo'
  },
  {
    criterio: 'Movilidad',
    opciones: [
      '1. Completamente inmóvil: no puede cambiar de posición.',
      '2. Muy limitada: cambios ligeros ocasionales.',
      '3. Ligeramente limitada: cambios ligeros frecuentes por sí solo.',
      '4. Sin limitaciones: cambios importantes frecuentes sin ayuda.',
    ],
    riesgo: '1-2 Con riesgo, 3-4 Sin riesgo'
  },
  {
    criterio: 'Nutrición',
    opciones: [
      '1. Muy pobre: ingiere menos de un tercio de los alimentos, ayunas o dieta líquida >5 días.',
      '2. Probablemente inadecuada: ingiere la mitad de los alimentos, ocasional suplemento.',
      '3. Adecuada: ingiere más de la mitad, suplemento ocasional.',
      '4. Excelente: ingiere la mayor parte, no requiere suplemento.',
    ],
    riesgo: '1-2 Con riesgo, 3-4 Sin riesgo'
  },
  {
    criterio: 'Roce de peligro de lesiones',
    opciones: [
      '1. Problema: requiere máxima asistencia, deslizamientos frecuentes.',
      '2. Probablemente inadecuada: mínima asistencia, puede rozar en movimientos.',
      '3. Adecuada: se mueve independiente, mantiene buena posición.',
      '4. Sin limitaciones: cambios importantes de posición sin ayuda.',
    ],
    riesgo: '1-2 Con riesgo, 3-4 Sin riesgo'
  },
];

export default function BradenScreen({ setScreen, pacienteActual, setPacienteActual }) {
  const { guardarResultadoPrueba } = useContext(EvaluationContext);

  const [respuestas, setRespuestas] = useState(
    BRADEN_TABLE.reduce((acc, c) => ({ ...acc, [c.criterio]: null }), {})
  );

  const seleccionar = (criterio, valor) => {
    setRespuestas(prev => ({ ...prev, [criterio]: valor }));
  };

  const guardarPrueba = () => {
    if (Object.values(respuestas).includes(null)) {
      Alert.alert("Atención", "Responde todos los criterios.");
      return;
    }

    const puntajeTotal = Object.values(respuestas).reduce((sum, val) => sum + val, 0);

    let interpretacion = "";
    if (puntajeTotal < 12) interpretacion = "Alto riesgo";
    else if (puntajeTotal <= 14) interpretacion = "Riesgo medio";
    else interpretacion = "Bajo riesgo";

    const resultado = {
      nombre: "Braden",
      puntaje: puntajeTotal,
      puntajeMax: 24,
      interpretacion: interpretacion,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      detalles: respuestas,
    };

    guardarResultadoPrueba("Braden", resultado);

    const nuevaEvaluacion = {
      tipo: "Escala de Braden",
      fecha: new Date().toLocaleDateString(),
      puntaje: puntajeTotal,
      detalle: { respuestas, interpretacion },
    };

    setPacienteActual(prev => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), nuevaEvaluacion],
    }));

    Alert.alert("Prueba Guardada", `Puntaje: ${puntajeTotal}\n${interpretacion}`);
    setScreen("Agendar Cita");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Escala de Braden</Text>

      {BRADEN_TABLE.map((c, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.pregunta}>{idx + 1}) {c.criterio}</Text>
          {c.opciones.map((op, i) => (
            <Pressable
              key={i}
              style={[
                styles.opcion,
                respuestas[c.criterio] === i + 1 && styles.selected,
              ]}
              onPress={() => seleccionar(c.criterio, i + 1)}
            >
              <Text style={respuestas[c.criterio] === i + 1 ? styles.selectedText : styles.text}>
                {i + 1}. {op}
              </Text>
            </Pressable>
          ))}
          <Text style={styles.riesgo}><Text style={{fontWeight:'bold'}}>Riesgo:</Text> {c.riesgo}</Text>
        </View>
      ))}

      <Pressable style={styles.botonGuardar} onPress={guardarPrueba}>
        <Text style={styles.botonTexto}>Guardar Prueba</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F4F6F8" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#0D47A1" },
  card: { backgroundColor: "white", padding: 15, borderRadius: 10, marginBottom: 15 },
  pregunta: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  opcion: { padding: 10, borderWidth: 1, borderRadius: 8, marginBottom: 5 },
  selected: { backgroundColor: "#1565C0", borderColor: "#1565C0" },
  text: { color: "black" },
  selectedText: { color: "white", fontWeight: "bold" },
  riesgo: { marginTop: 5, fontSize: 12, color: "#555" },
  botonGuardar: { backgroundColor: "#2E7D32", padding: 18, borderRadius: 12, alignItems: "center", marginTop: 20 },
  botonTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
});