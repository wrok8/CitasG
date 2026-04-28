import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { EvaluationContext } from '../context/EvaluationContext';

export default function SPPBScreen({ setScreen, pacienteActual, setPacienteActual }) {
  const { guardarResultadoPrueba } = useContext(EvaluationContext);

  const [puntosEquilibrio, setPuntosEquilibrio] = useState(0);
  const [puntosMarcha, setPuntosMarcha] = useState(0);
  const [puntosSilla, setPuntosSilla] = useState(0);

  const total = puntosEquilibrio + puntosMarcha + puntosSilla;

  useEffect(() => {
    let last = { x: 0, y: 0, z: 0 };

    const subscription = Accelerometer.addListener(data => {
      const delta =
        Math.abs(data.x - last.x) +
        Math.abs(data.y - last.y) +
        Math.abs(data.z - last.z);

      if (delta > 2.2) {
        setPuntosEquilibrio(0);
        setPuntosMarcha(0);
        setPuntosSilla(0);
      }

      last = data;
    });

    Accelerometer.setUpdateInterval(300);

    return () => subscription.remove();
  }, []);

  const RadioButton = ({ label, value, selectedValue, onSelect }) => (
    <TouchableOpacity 
      style={[styles.radioItem, selectedValue === value && styles.radioSelected]} 
      onPress={() => onSelect(value)}
    >
      <Text style={selectedValue === value ? styles.radioTextSelected : styles.radioText}>{label}</Text>
    </TouchableOpacity>
  );

  const guardarEvaluacion = () => {
    if (!pacienteActual) {
      Alert.alert("Error", "No hay paciente seleccionado");
      return;
    }

    const interpretacion = total <= 9 ? "ALTO RIESGO DE FRAGILIDAD" : "DESEMPEÑO NORMAL";

    const resultado = {
      nombre: "SPPB",
      puntaje: total,
      puntajeMax: 12,
      interpretacion: interpretacion,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      detalles: {
        equilibrio: puntosEquilibrio,
        marcha: puntosMarcha,
        silla: puntosSilla
      },
    };

    guardarResultadoPrueba("SPPB", resultado);

    const nuevaEvaluacion = {
      tipo: "SPPB",
      fecha: new Date().toLocaleDateString(),
      puntaje: total,
      detalle: {
        equilibrio: puntosEquilibrio,
        marcha: puntosMarcha,
        silla: puntosSilla,
        interpretacion
      },
    };

    setPacienteActual(prev => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), nuevaEvaluacion],
    }));

    Alert.alert(
      "Evaluación Guardada",
      `Puntaje: ${total}/12\nResultado: ${interpretacion}`
    );

    setScreen("Agendar Cita");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Batería de Desempeño Físico (SPPB)</Text>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. Pruebas de Equilibrio</Text>
        <RadioButton label="No pudo / < 10 seg (0 pts)" value={0} selectedValue={puntosEquilibrio} onSelect={setPuntosEquilibrio} />
        <RadioButton label="Pies juntos y semitándem (2 pts)" value={2} selectedValue={puntosEquilibrio} onSelect={setPuntosEquilibrio} />
        <RadioButton label="Completó todas las posiciones (4 pts)" value={4} selectedValue={puntosEquilibrio} onSelect={setPuntosEquilibrio} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>2. Velocidad de la Marcha (4m)</Text>
        <RadioButton label="Más de 8.7 seg (1 pt)" value={1} selectedValue={puntosMarcha} onSelect={setPuntosMarcha} />
        <RadioButton label="4.82 - 6.20 seg (3 pts)" value={3} selectedValue={puntosMarcha} onSelect={setPuntosMarcha} />
        <RadioButton label="Menos de 4.82 seg (4 pts)" value={4} selectedValue={puntosMarcha} onSelect={setPuntosMarcha} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>3. Levantarse de la silla (5 veces)</Text>
        <RadioButton label="No pudo / > 60 seg (0 pts)" value={0} selectedValue={puntosSilla} onSelect={setPuntosSilla} />
        <RadioButton label="13.7 - 16.6 seg (2 pts)" value={2} selectedValue={puntosSilla} onSelect={setPuntosSilla} />
        <RadioButton label="Menos de 11.1 seg (4 pts)" value={4} selectedValue={puntosSilla} onSelect={setPuntosSilla} />
      </View>

      <View style={[styles.resultCard, total <= 9 ? styles.alertLow : styles.alertHigh]}>
        <Text style={styles.resultText}>Puntaje Total: {total} / 12</Text>
        <Text style={styles.interpretacion}>
          {total <= 9 ? "ALTO RIESGO DE FRAGILIDAD" : "DESEMPEÑO NORMAL"}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={guardarEvaluacion}
      >
        <Text style={styles.buttonText}>Guardar Evaluación</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#6200ee', marginBottom: 10 },
  radioItem: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginVertical: 4 },
  radioSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  radioText: { color: '#444' },
  radioTextSelected: { color: '#fff', fontWeight: 'bold' },
  resultCard: { padding: 20, borderRadius: 10, alignItems: 'center' },
  alertLow: { backgroundColor: '#ffebee' },
  alertHigh: { backgroundColor: '#e8f5e9' },
  resultText: { fontSize: 20, fontWeight: 'bold' },
  interpretacion: { fontSize: 14, marginTop: 5, fontWeight: 'bold' },
  button: { backgroundColor: '#6200ee', padding: 15, borderRadius: 10, marginVertical: 30, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});