import React, { useState, useMemo, useContext } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FormField } from "../components/FormField";
import { FormSection } from "../components/FormSection";
import { EvaluationContext } from "../context/EvaluationContext";

export default function MoCAScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const { guardarResultadoPrueba } = useContext(EvaluationContext);

  const [escolaridad, setEscolaridad] = useState("");

  const [trazado, setTrazado] = useState("");
  const [cubo, setCubo] = useState("");
  const [relojContorno, setRelojContorno] = useState("");
  const [relojNumeros, setRelojNumeros] = useState("");
  const [relojAgujas, setRelojAgujas] = useState("");

  const [animal1, setAnimal1] = useState("");
  const [animal2, setAnimal2] = useState("");
  const [animal3, setAnimal3] = useState("");

  const [digitoDirecto, setDigitoDirecto] = useState("");
  const [digitoInverso, setDigitoInverso] = useState("");
  const [letraA, setLetraA] = useState("");
  const [restasCorrectas, setRestasCorrectas] = useState("");

  const [frase1, setFrase1] = useState("");
  const [frase2, setFrase2] = useState("");
  const [fluidezF, setFluidezF] = useState("");

  const [abstraccion1, setAbstraccion1] = useState("");
  const [abstraccion2, setAbstraccion2] = useState("");

  const [recuerdo, setRecuerdo] = useState("");

  const [orientacion, setOrientacion] = useState("");

  const total = useMemo(() => {
    let score = 0;

    score += Number(trazado || 0);
    score += Number(cubo || 0);
    score += Number(relojContorno || 0);
    score += Number(relojNumeros || 0);
    score += Number(relojAgujas || 0);

    score += Number(animal1 || 0);
    score += Number(animal2 || 0);
    score += Number(animal3 || 0);

    score += Number(digitoDirecto || 0);
    score += Number(digitoInverso || 0);
    score += Number(letraA || 0);

    const restas = Number(restasCorrectas || 0);
    if (restas >= 4) score += 3;
    else if (restas >= 2) score += 2;
    else if (restas === 1) score += 1;

    score += Number(frase1 || 0);
    score += Number(frase2 || 0);
    if (Number(fluidezF) > 11) score += 1;

    score += Number(abstraccion1 || 0);
    score += Number(abstraccion2 || 0);

    score += Number(recuerdo || 0);

    score += Number(orientacion || 0);

    if (Number(escolaridad) <= 12 && escolaridad !== "") {
      score += 1;
    }

    return score;
  }, [
    trazado,
    cubo,
    relojContorno,
    relojNumeros,
    relojAgujas,
    animal1,
    animal2,
    animal3,
    digitoDirecto,
    digitoInverso,
    letraA,
    restasCorrectas,
    frase1,
    frase2,
    fluidezF,
    abstraccion1,
    abstraccion2,
    recuerdo,
    orientacion,
    escolaridad,
  ]);

  const obtenerInterpretacion = (puntaje) => {
    if (puntaje >= 26) return "Cognición normal";
    if (puntaje >= 18) return "Deterioro cognitivo leve";
    return "Deterioro cognitivo moderado a severo";
  };

  const handleGuardar = () => {
    const puntajeTotal = total;
    const interpretacion = obtenerInterpretacion(puntajeTotal);

    const resultado = {
      nombre: "MoCA",
      puntaje: puntajeTotal,
      puntajeMax: 30,
      interpretacion: interpretacion,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      detalles: {
        visuoespacial: Number(trazado || 0) + Number(cubo || 0) + Number(relojContorno || 0) + Number(relojNumeros || 0) + Number(relojAgujas || 0),
        identificacion: Number(animal1 || 0) + Number(animal2 || 0) + Number(animal3 || 0),
        atencion: Number(digitoDirecto || 0) + Number(digitoInverso || 0) + Number(letraA || 0),
        restas: Number(restasCorrectas || 0),
        lenguaje: Number(frase1 || 0) + Number(frase2 || 0),
        fluidez: Number(fluidezF || 0),
        abstraccion: Number(abstraccion1 || 0) + Number(abstraccion2 || 0),
        recuerdo: Number(recuerdo || 0),
        orientacion: Number(orientacion || 0),
        escolaridad: Number(escolaridad || 0),
      },
    };

    guardarResultadoPrueba("MoCA", resultado);

    if (pacienteActual) {
      const nuevaPrueba = {
        tipo: "MoCA",
        fecha: new Date().toLocaleDateString(),
        puntaje: puntajeTotal,
        detalle: [`Puntaje total: ${puntajeTotal}/30`],
      };

      setPacienteActual({
        ...pacienteActual,
        pruebas: [
          ...(pacienteActual.pruebas || []),
          nuevaPrueba,
        ],
      });
    }

    Alert.alert("✅ Éxito", `MoCA guardado\nPuntaje: ${puntajeTotal}/30\n${interpretacion}`);
    setScreen("Agendar Cita");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <ScrollView style={{ padding: 20 }}>

        <Text style={styles.title}>MoCA - 30 puntos</Text>

        <FormSection title="Visuoespacial / Ejecutiva (5)">
          <FormField label="Trazado (0-1)" keyboardType="numeric" value={trazado} onChangeText={setTrazado}/>
          <FormField label="Cubo (0-1)" keyboardType="numeric" value={cubo} onChangeText={setCubo}/>
          <FormField label="Reloj Contorno (0-1)" keyboardType="numeric" value={relojContorno} onChangeText={setRelojContorno}/>
          <FormField label="Reloj Números (0-1)" keyboardType="numeric" value={relojNumeros} onChangeText={setRelojNumeros}/>
          <FormField label="Reloj Agujas (0-1)" keyboardType="numeric" value={relojAgujas} onChangeText={setRelojAgujas}/>
        </FormSection>

        <FormSection title="Identificación (3)">
          <FormField label="Animal 1 (0-1)" keyboardType="numeric" value={animal1} onChangeText={setAnimal1}/>
          <FormField label="Animal 2 (0-1)" keyboardType="numeric" value={animal2} onChangeText={setAnimal2}/>
          <FormField label="Animal 3 (0-1)" keyboardType="numeric" value={animal3} onChangeText={setAnimal3}/>
        </FormSection>

        <FormSection title="Atención (6)">
          <FormField label="Dígitos Directo (0-1)" keyboardType="numeric" value={digitoDirecto} onChangeText={setDigitoDirecto}/>
          <FormField label="Dígitos Inverso (0-1)" keyboardType="numeric" value={digitoInverso} onChangeText={setDigitoInverso}/>
          <FormField label="Letra A (0-1)" keyboardType="numeric" value={letraA} onChangeText={setLetraA}/>
          <FormField label="Restas correctas (0-5)" keyboardType="numeric" value={restasCorrectas} onChangeText={setRestasCorrectas}/>
        </FormSection>

        <FormSection title="Lenguaje (3)">
          <FormField label="Frase 1 (0-1)" keyboardType="numeric" value={frase1} onChangeText={setFrase1}/>
          <FormField label="Frase 2 (0-1)" keyboardType="numeric" value={frase2} onChangeText={setFrase2}/>
          <FormField label="Palabras con F (cantidad)" keyboardType="numeric" value={fluidezF} onChangeText={setFluidezF}/>
        </FormSection>

        <FormSection title="Abstracción (2)">
          <FormField label="Semejanza 1 (0-1)" keyboardType="numeric" value={abstraccion1} onChangeText={setAbstraccion1}/>
          <FormField label="Semejanza 2 (0-1)" keyboardType="numeric" value={abstraccion2} onChangeText={setAbstraccion2}/>
        </FormSection>

        <FormSection title="Recuerdo Diferido (5)">
          <FormField label="Palabras recordadas (0-5)" keyboardType="numeric" value={recuerdo} onChangeText={setRecuerdo}/>
        </FormSection>

        <FormSection title="Orientación (6)">
          <FormField label="Respuestas correctas (0-6)" keyboardType="numeric" value={orientacion} onChangeText={setOrientacion}/>
        </FormSection>

        <View style={styles.totalBox}>
          <Text style={styles.totalText}>Total: {total}/30</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleGuardar}>
          <Text style={{ color: "#FFF", fontWeight: "bold" }}>
            Guardar Evaluación
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  totalBox: { marginTop: 20, padding: 20, backgroundColor: "#E7F0FF", borderRadius: 10, alignItems: "center" },
  totalText: { fontSize: 18, fontWeight: "bold" },
  btn: { marginTop: 20, backgroundColor: "#000814", padding: 15, borderRadius: 10, alignItems: "center" }
});