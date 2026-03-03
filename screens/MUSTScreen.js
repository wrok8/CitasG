import React, { useState } from "react";
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

export default function MUSTScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const [peso, setPeso] = useState("");
  const [talla, setTalla] = useState("");
  const [perdidaPesoPct, setPerdidaPesoPct] = useState("");
  const [estaEnfermo, setEstaEnfermo] = useState(false);
  const [sintomas, setSintomas] = useState("");

  // 🚨 Si no hay paciente seleccionado
  if (!pacienteActual) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>No hay paciente seleccionado</Text>
        <Pressable
          style={styles.btnGuardar}
          onPress={() => setScreen("Agendar Cita")}
        >
          <Text style={styles.buttonText}>IR A REGISTRAR PACIENTE</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // 🔢 Calcular puntaje MUST
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
        "Llevar a cabo una intervención y acción directa para evitar complicaciones asociadas.";
    }

    return {
      imc: imcNum.toFixed(1),
      puntos,
      riesgo,
      pauta,
    };
  };

  // 💾 Guardar prueba
  const handleGuardar = () => {
    if ([peso, talla].includes("")) {
      Alert.alert("Error", "Completa peso y talla");
      return;
    }

    if (!pacienteActual) {
      Alert.alert("Error", "No hay paciente seleccionado");
      return;
    }

    const resultado = calcularMUST();

    if (!resultado) {
      Alert.alert("Error", "Verifica peso y talla");
      return;
    }

    const nuevaEvaluacion = {
      tipo: "MUST",
      fecha: new Date().toLocaleDateString(),
      puntaje: resultado.puntos,
      detalle: {
        imc: resultado.imc,
        riesgo: resultado.riesgo,
        pauta: resultado.pauta,
        peso,
        talla,
        perdidaPesoPct,
        estaEnfermo,
        sintomas,
      },
    };

    // 🔥 EXACTAMENTE igual que Fluencia y Katz
    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), nuevaEvaluacion],
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