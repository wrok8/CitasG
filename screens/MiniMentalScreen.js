import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";

const preguntas = [
  { id: 0,  pregunta: "¿Qué año es?",                        encabezado: "Orientación Temporal"  },
  { id: 1,  pregunta: "¿En qué mes estamos?",                encabezado: "Orientación Temporal"  },
  { id: 2,  pregunta: "¿Qué día del mes es hoy?",            encabezado: "Orientación Temporal"  },
  { id: 3,  pregunta: "¿Qué día de la semana es hoy?",       encabezado: "Orientación Temporal"  },
  { id: 4,  pregunta: "¿En qué país estamos?",               encabezado: "Orientación Espacial"  },
  { id: 5,  pregunta: "¿En qué estado estamos?",             encabezado: "Orientación Espacial"  },
  { id: 6,  pregunta: "¿En qué ciudad estamos?",             encabezado: "Orientación Espacial"  },
  { id: 7,  pregunta: "¿En qué lugar estamos?",              encabezado: "Orientación Espacial"  },
  { id: 8,  pregunta: "¿En qué piso estamos?",               encabezado: "Orientación Espacial"  },
  { id: 9,  pregunta: "Repita: Casa, Árbol, Perro",          encabezado: "Memoria Inmediata"     },
  { id: 10, pregunta: "Restar de 7 en 7 desde 100",          encabezado: "Atención y Cálculo"    },
  { id: 11, pregunta: "Recuerde las palabras",               encabezado: "Memoria"               },
  { id: 12, pregunta: '"Ni sí, ni no, ni pero"',             encabezado: "Repetición"            },
  { id: 13, pregunta: "Tome, doble y ponga en el suelo",     encabezado: "Órdenes"               },
  { id: 14, pregunta: "¿Qué objeto es?",                     encabezado: "Lenguaje"              },
  { id: 15, pregunta: "¿Qué objeto es?",                     encabezado: "Lenguaje"              },
  { id: 16, pregunta: "Lea y haga lo indicado",              encabezado: "Lectura"               },
];

export default function MiniMentalScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  const [respuestas,       setRespuestas]       = useState({});
  const [palabrasMemoria,  setPalabrasMemoria]  = useState({ casa: false, arbol: false, perro: false });
  const [palabrasRecuerdo, setPalabrasRecuerdo] = useState({ casa: false, arbol: false, perro: false });
  const [numeros,          setNumeros]          = useState({ 93: false, 86: false, 79: false, 72: false, 65: false });
  const [acciones,         setAcciones]         = useState({ tomar: false, doblar: false, tirar: false });

  const toggle = (setter) => (key) =>
    setter((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleRespuesta  = (id)     => setRespuestas((prev)  => ({ ...prev, [id]: !prev[id] }));
  const togglePalabra    = toggle(setPalabrasMemoria);
  const toggleRecuerdo   = toggle(setPalabrasRecuerdo);
  const toggleNumero     = toggle(setNumeros);
  const toggleAccion     = toggle(setAcciones);

  const puntajeOrientacion = Object.values(respuestas).filter(Boolean).length;
  const puntajeMemoria     = Object.values(palabrasMemoria).filter(Boolean).length;
  const puntajeRecuerdo    = Object.values(palabrasRecuerdo).filter(Boolean).length;
  const puntajeNumeros     = Object.values(numeros).filter(Boolean).length;
  const puntajeAcciones    = Object.values(acciones).filter(Boolean).length;

  const puntaje =
    puntajeOrientacion +
    puntajeMemoria     +
    puntajeRecuerdo    +
    puntajeNumeros     +
    puntajeAcciones;

  const interpretacion =
    puntaje >= 27 ? "Normal"                      :
    puntaje >= 21 ? "Deterioro leve"              :
    puntaje >= 11 ? "Deterioro moderado"          :
                    "Deterioro severo";

  const guardarEvaluacion = () => {
    if (!pacienteActual) {
      Alert.alert("Error", "No hay paciente seleccionado");
      return;
    }

    const nuevaPrueba = {
      tipo:   "Mini Mental",
      fecha:  new Date().toLocaleDateString(),
      puntaje,
      detalle: [
        `Orientación: ${puntajeOrientacion}/8`,
        `Memoria inmediata: ${puntajeMemoria}/3`,
        `Atención y cálculo: ${puntajeNumeros}/5`,
        `Recuerdo diferido: ${puntajeRecuerdo}/3`,
        `Lenguaje y órdenes: ${puntajeAcciones + puntajeOrientacion}/11`,
        `Interpretación: ${interpretacion}`,
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
      `Puntaje total: ${puntaje}/27 — ${interpretacion}`,
      [{ text: "OK", onPress: () => setScreen("Agendar Cita") }]
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Barra de puntaje fija */}
      <View style={styles.scoreBar}>
        <Text style={styles.scoreText}>
          Puntaje: {puntaje} / 27 — {interpretacion}
        </Text>
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Evaluación Mini Mental</Text>

        {preguntas.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.sectionTitle}>{item.encabezado}</Text>
            <Text style={styles.question}>{item.pregunta}</Text>

            {/* Memoria inmediata */}
            {item.id === 9 ? (
              ["casa", "arbol", "perro"].map((p) => (
                <CheckRow
                  key={p}
                  label={p}
                  checked={palabrasMemoria[p]}
                  onPress={() => togglePalabra(p)}
                />
              ))

            /* Atención y cálculo */
            ) : item.id === 10 ? (
              [93, 86, 79, 72, 65].map((n) => (
                <CheckRow
                  key={n}
                  label={String(n)}
                  checked={numeros[n]}
                  onPress={() => toggleNumero(n)}
                />
              ))

            /* Recuerdo diferido */
            ) : item.id === 11 ? (
              ["casa", "arbol", "perro"].map((p) => (
                <CheckRow
                  key={p}
                  label={p}
                  checked={palabrasRecuerdo[p]}
                  onPress={() => toggleRecuerdo(p)}
                />
              ))

            /* Órdenes motoras */
            ) : item.id === 13 ? (
              ["tomar", "doblar", "tirar"].map((a) => (
                <CheckRow
                  key={a}
                  label={a}
                  checked={acciones[a]}
                  onPress={() => toggleAccion(a)}
                />
              ))

            /* Lenguaje con imagen – reloj */
            ) : item.id === 14 ? (
              <>
                <Image
                  source={require("../assets/images/reloj.jpg")}
                  style={styles.testImage}
                />
                <CheckRow
                  label="Correcto"
                  checked={!!respuestas[item.id]}
                  onPress={() => toggleRespuesta(item.id)}
                />
              </>

            /* Lenguaje con imagen – lápiz */
            ) : item.id === 15 ? (
              <>
                <Image
                  source={require("../assets/images/lapiz2.png")}
                  style={styles.testImage}
                />
                <CheckRow
                  label="Correcto"
                  checked={!!respuestas[item.id]}
                  onPress={() => toggleRespuesta(item.id)}
                />
              </>

            /* Lectura con imagen */
            ) : item.id === 16 ? (
              <>
                <Image
                  source={require("../assets/images/cierralosojos.png")}
                  style={styles.testImage}
                />
                <CheckRow
                  label="Correcto"
                  checked={!!respuestas[item.id]}
                  onPress={() => toggleRespuesta(item.id)}
                />
              </>

            /* Resto de preguntas */
            ) : (
              <CheckRow
                label="Respuesta correcta"
                checked={!!respuestas[item.id]}
                onPress={() => toggleRespuesta(item.id)}
              />
            )}
          </View>
        ))}

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={guardarEvaluacion}
          >
            <Text style={styles.saveButtonText}>
              GUARDAR Y AGENDAR CITA
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CheckRow({ label, checked, onPress }) {
  return (
    <TouchableOpacity style={styles.checkboxRow} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]} />
      <Text>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea:        { flex: 1, backgroundColor: "#F8F9FA" },
  container:       { flex: 1, padding: 16 },
  scoreBar:        { padding: 16, backgroundColor: "#001D3D" },
  scoreText:       { color: "#FFF", fontWeight: "bold", fontSize: 18 },
  title:           { fontSize: 22, fontWeight: "bold", marginVertical: 20 },
  card:            { backgroundColor: "#FFF", padding: 16, borderRadius: 12, marginBottom: 16 },
  sectionTitle:    { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  question:        { fontSize: 15, marginBottom: 12 },
  checkboxRow:     { flexDirection: "row", alignItems: "center", marginVertical: 6, gap: 10 },
  checkbox:        { width: 22, height: 22, borderWidth: 2, borderColor: "#999", borderRadius: 5 },
  checkboxChecked: { backgroundColor: "#2ECC71", borderColor: "#2ECC71" },
  testImage:       { width: 120, height: 120, alignSelf: "center", marginVertical: 10 },
  footer:          { marginTop: 20, marginBottom: 30 },
  saveButton:      { backgroundColor: "#1565C0", paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  saveButtonText:  { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});