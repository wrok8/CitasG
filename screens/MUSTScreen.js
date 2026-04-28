import React, { useState, useEffect, useContext } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Accelerometer } from "expo-sensors";
import { EvaluationContext } from "../context/EvaluationContext";

export default function MUSTScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const { guardarResultadoPrueba } = useContext(EvaluationContext);

  const [peso, setPeso] = useState("");
  const [talla, setTalla] = useState("");
  const [perdidaPesoPct, setPerdidaPesoPct] = useState("");
  const [estaEnfermo, setEstaEnfermo] = useState(false);
  const [sintomas, setSintomas] = useState("");

  // 🔥 SENSOR PARA REINICIAR
  useEffect(() => {
    let lastShake = 0;

    const subscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const total = Math.abs(x) + Math.abs(y) + Math.abs(z);

      if (total > 2.2) {
        const now = Date.now();
        if (now - lastShake > 1500) {
          lastShake = now;

          // 🔄 RESET
          setPeso("");
          setTalla("");
          setPerdidaPesoPct("");
          setEstaEnfermo(false);
          setSintomas("");

          Alert.alert(
            "Reinicio",
            "La prueba fue reiniciada por movimiento del dispositivo"
          );
        }
      }
    });

    Accelerometer.setUpdateInterval(300);

    return () => subscription.remove();
  }, []);

  // 🔢 CALCULAR MUST
  const calcularMUST = () => {
    let puntos = 0;

    const pesoNum = parseFloat(peso);
    const tallaNum = parseFloat(talla);

    if (!pesoNum || !tallaNum || tallaNum === 0) {
      return null;
    }

    const imcNum = pesoNum / (tallaNum * tallaNum);

    // IMC
    if (imcNum < 18.5) puntos += 2;
    else if (imcNum <= 20) puntos += 1;

    // Pérdida de peso
    const perdida = parseFloat(perdidaPesoPct);
    if (!isNaN(perdida)) {
      if (perdida > 10) puntos += 2;
      else if (perdida >= 5) puntos += 1;
    }

    // Enfermedad aguda
    if (estaEnfermo) puntos += 2;

    let riesgo = "Bajo";
    let pauta =
      "Puede continuar con su estilo de vida con revisión periódica.";

    if (puntos === 1) {
      riesgo = "Intermedio";
      pauta =
        "Se debe estructurar un plan de cuidado nutricional y revaloración.";
    } else if (puntos >= 2) {
      riesgo = "Alto";
      pauta =
        "Llevar a cabo una intervención y acción directa para evitar complicaciones.";
    }

    return {
      imc: imcNum.toFixed(1),
      puntos,
      riesgo,
      pauta,
    };
  };

  // 💾 GUARDAR
  const handleGuardar = () => {
    if ([peso, talla].includes("")) {
      Alert.alert("Error", "Completa peso y talla");
      return;
    }

    const resultado = calcularMUST();

    if (!resultado) {
      Alert.alert("Error", "Verifica peso y talla");
      return;
    }

    // 🔥 FORMATO PARA EL CONTEXT (IMPORTANTE)
    const resultadoContexto = {
      nombre: "MUST",
      puntaje: resultado.puntos,
      puntajeMax: 6,
      interpretacion: resultado.riesgo,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      detalles: {
        imc: resultado.imc,
        pauta: resultado.pauta,
        peso,
        talla,
        perdidaPesoPct,
        estaEnfermo,
        sintomas,
      },
    };

    // ✅ GUARDADO REAL (EL QUE USA LA APP)
    guardarResultadoPrueba("MUST", resultadoContexto);

    // (Opcional) compatibilidad con pacienteActual
    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), resultadoContexto],
    }));

    Alert.alert(
      "Prueba Guardada",
      `Puntaje: ${resultado.puntos}\nRiesgo: ${resultado.riesgo}`
    );

    setScreen("Agendar Cita");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Evaluación Nutricional MUST</Text>

        <View style={styles.row}>
          <View style={[styles.campo, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={peso}
              onChangeText={setPeso}
            />
          </View>

          <View style={[styles.campo, { flex: 1 }]}>
            <Text style={styles.label}>Talla (m)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="1.65"
              value={talla}
              onChangeText={setTalla}
            />
          </View>
        </View>

        <View style={styles.campo}>
          <Text style={styles.label}>
            % Pérdida de peso (3-6 meses)
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={perdidaPesoPct}
            onChangeText={setPerdidaPesoPct}
          />
        </View>

        <Pressable
          style={[
            styles.switchBtn,
            estaEnfermo && styles.switchBtnActive,
          ]}
          onPress={() => setEstaEnfermo(!estaEnfermo)}
        >
          <Text style={styles.switchText}>
            {estaEnfermo
              ? "✓ Enfermedad Aguda Detectada (+2 pts)"
              : "¿Ausencia de ingesta >5 días?"}
          </Text>
        </Pressable>

        <View style={styles.campo}>
          <Text style={styles.label}>Observaciones / Síntomas</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            multiline
            value={sintomas}
            onChangeText={setSintomas}
          />
        </View>

        <Pressable style={styles.btnGuardar} onPress={handleGuardar}>
          <Text style={styles.buttonText}>GUARDAR</Text>
        </Pressable>

        <Pressable onPress={() => setScreen("NutricionalMenu")}>
          <Text style={styles.cancelar}>CANCELAR</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F3F4F6" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#6D28D9",
  },
  campo: { marginBottom: 15 },
  label: { fontWeight: "bold", marginBottom: 5 },
  input: { backgroundColor: "#FFF", padding: 12, borderRadius: 10 },
  row: { flexDirection: "row" },
  switchBtn: {
    padding: 15,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginBottom: 15,
  },
  switchBtnActive: {
    backgroundColor: "#FEE2E2",
  },
  switchText: { textAlign: "center", fontWeight: "bold" },
  btnGuardar: {
    backgroundColor: "#6D28D9",
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  cancelar: {
    textAlign: "center",
    color: "#EF4444",
    fontWeight: "bold",
    marginBottom: 40,
  },
});