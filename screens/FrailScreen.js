import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Accelerometer, Gyroscope, Magnetometer } from "expo-sensors";

export default function FrailScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  // ── Sensores ───────────────────────────────────────────────────────────
  const [acc,  setAcc]  = useState({ x: 0, y: 0, z: 0 });
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 });
  const [mag,  setMag]  = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    Accelerometer.setUpdateInterval(500);
    const subs = [
      Accelerometer.addListener(setAcc),
      Gyroscope.addListener(setGyro),
      Magnetometer.addListener(setMag),
    ];
    return () => subs.forEach((s) => s.remove());
  }, []);

  // ── Puntajes FRAIL ─────────────────────────────────────────────────────
  const [f, setF] = useState(0); // Fatiga
  const [r, setR] = useState(0); // Resistencia
  const [a, setA] = useState(0); // Aeróbico
  const [i, setI] = useState(0); // Illness
  const [l, setL] = useState(0); // Loss of weight

  const total = f + r + a + i + l;

  const estado =
    total >= 3 ? "Frágil"     :
    total >= 1 ? "Pre-frágil" :
                 "Robusto";

  // ── Guardar igual que MiniCog ──────────────────────────────────────────
  const guardarEvaluacion = () => {
    if (!pacienteActual) {
      Alert.alert("Error", "No hay paciente seleccionado");
      return;
    }

    const nuevaPrueba = {
      tipo:   "FRAIL",
      fecha:  new Date().toLocaleDateString(),
      puntaje: total,
      detalle: [
        `F - Fatiga: ${f}`,
        `R - Resistencia: ${r}`,
        `A - Aeróbico: ${a}`,
        `I - Illness (enfermedades): ${i}`,
        `L - Pérdida de peso: ${l}`,
        `Estado: ${estado}`,
      ],
    };

    const pruebasActualizadas = Array.isArray(pacienteActual.pruebas)
      ? [...pacienteActual.pruebas, nuevaPrueba]
      : [nuevaPrueba];

    setPacienteActual({
      ...pacienteActual,
      pruebas: pruebasActualizadas,
    });

    Alert.alert(
      "Evaluación guardada",
      `Puntaje: ${total}/5 — ${estado}`,
      [{ text: "OK", onPress: () => setScreen("Agendar Cita") }]
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>

        {/* Banner paciente */}
        {pacienteActual?.nombre && (
          <View style={styles.pacienteBanner}>
            <Text style={styles.pacienteTexto}>
              👤 Paciente: {pacienteActual.nombre}
            </Text>
          </View>
        )}

        {/* ── Sensores ── */}
        <Text style={styles.sectionHeader}>Monitoreo de Sensores</Text>

        <View style={styles.sensorCard}>
          <Text style={styles.sensorTitle}>📱 Acelerómetro (Caídas)</Text>
          <Text>
            X: {acc.x.toFixed(2)}  Y: {acc.y.toFixed(2)}  Z: {acc.z.toFixed(2)}
          </Text>
        </View>

        <View style={styles.sensorCard}>
          <Text style={styles.sensorTitle}>🔄 Giroscopio (Rotación)</Text>
          <Text>
            X: {gyro.x.toFixed(2)}  Y: {gyro.y.toFixed(2)}  Z: {gyro.z.toFixed(2)}
          </Text>
        </View>

        <View style={styles.sensorCard}>
          <Text style={styles.sensorTitle}>🧲 Magnetómetro</Text>
          <Text>
            Valor: {Math.sqrt(mag.x ** 2 + mag.y ** 2).toFixed(2)} μT
          </Text>
        </View>

        <View style={styles.separator} />

        {/* ── Cuestionario FRAIL ── */}
        <Text style={styles.header}>Cuestionario FRAIL</Text>
        <Text style={styles.subHeader}>
          Detección de fragilidad (Guía INGER)
        </Text>

        <PreguntaCard
          letra="F"
          titulo="Fatiga"
          descripcion="¿Se siente cansado la mayor parte del tiempo?"
          valor={f}
          onChange={setF}
        />
        <PreguntaCard
          letra="R"
          titulo="Resistencia"
          descripcion="¿Tiene dificultad para subir 10 escalones?"
          valor={r}
          onChange={setR}
        />
        <PreguntaCard
          letra="A"
          titulo="Aeróbico"
          descripcion="¿Tiene dificultad para caminar 100 metros?"
          valor={a}
          onChange={setA}
        />
        <PreguntaCard
          letra="I"
          titulo="Illness"
          descripcion="¿Tiene más de 5 enfermedades crónicas?"
          valor={i}
          onChange={setI}
        />
        <PreguntaCard
          letra="L"
          titulo="Loss of weight"
          descripcion="¿Perdió más del 5% de su peso en los últimos 6 meses?"
          valor={l}
          onChange={setL}
        />

        {/* ── Resultado ── */}
        <View style={[
          styles.resultCard,
          total >= 3 ? styles.fragil :
          total >= 1 ? styles.prefragil :
                       styles.sano,
        ]}>
          <Text style={styles.resultLabel}>Puntaje: {total} / 5</Text>
          <Text style={styles.resultStatus}>ESTADO: {estado.toUpperCase()}</Text>
          <Text style={styles.resultHint}>
            {total >= 3
              ? "Se recomienda evaluación geriátrica completa."
              : total >= 1
              ? "Monitoreo preventivo recomendado."
              : "Sin signos de fragilidad detectados."}
          </Text>
        </View>

        {/* ── Botón guardar ── */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={guardarEvaluacion}
        >
          <Text style={styles.saveButtonText}>
            GUARDAR Y AGENDAR CITA
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-componente de pregunta ───────────────────────────────────────────────
function PreguntaCard({ letra, titulo, descripcion, valor, onChange }) {
  return (
    <View style={styles.card}>
      <Text style={styles.questionTitle}>
        {letra} — {titulo}
      </Text>
      <Text style={styles.description}>{descripcion}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.option, valor === 1 && styles.optionSelected]}
          onPress={() => onChange(1)}
        >
          <Text style={[styles.optionText, valor === 1 && styles.optionTextSelected]}>
            Sí (1 pt)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, valor === 0 && styles.optionSelected]}
          onPress={() => onChange(0)}
        >
          <Text style={[styles.optionText, valor === 0 && styles.optionTextSelected]}>
            No (0 pts)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea:       { flex: 1, backgroundColor: "#f0f2f5" },
  container:      { flex: 1, padding: 15 },

  pacienteBanner: { backgroundColor: "#E3F2FD", padding: 12, borderRadius: 10, marginBottom: 14, alignItems: "center" },
  pacienteTexto:  { fontWeight: "bold", color: "#0D47A1", fontSize: 14 },

  sectionHeader:  { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#333" },

  sensorCard:     { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  sensorTitle:    { fontSize: 15, fontWeight: "bold", color: "#6200ee", marginBottom: 5 },

  separator:      { height: 1, backgroundColor: "#ccc", marginVertical: 25 },

  header:         { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  subHeader:      { fontSize: 14, textAlign: "center", color: "#666", marginBottom: 20 },

  card:           { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  questionTitle:  { fontSize: 17, fontWeight: "bold", color: "#6200ee", marginBottom: 4 },
  description:    { fontSize: 14, color: "#444", marginBottom: 10 },

  row:            { flexDirection: "row", justifyContent: "space-between" },
  option:         { flex: 0.48, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", alignItems: "center" },
  optionSelected: { backgroundColor: "#6200ee", borderColor: "#6200ee" },
  optionText:     { color: "#666", fontWeight: "bold" },
  optionTextSelected: { color: "#fff" },

  resultCard:     { padding: 20, borderRadius: 12, alignItems: "center", marginBottom: 14, elevation: 2 },
  sano:           { backgroundColor: "#e8f5e9" },
  prefragil:      { backgroundColor: "#fff3e0" },
  fragil:         { backgroundColor: "#ffebee" },
  resultLabel:    { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  resultStatus:   { fontSize: 17, fontWeight: "bold", marginBottom: 6 },
  resultHint:     { fontSize: 13, color: "#555", textAlign: "center" },

  saveButton:     { backgroundColor: "#1565C0", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 4 },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});