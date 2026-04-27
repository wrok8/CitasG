import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { EvaluationContext } from "../context/EvaluationContext";

export default function OARSScreen({
  setScreen,
  pacienteActual,
  setPacienteActual,
}) {
  // ── Context ────────────────────────────────────────────────────────────────
  const { citaEnProgreso, guardarResultadoPrueba } = useContext(EvaluationContext);

  // ── Estados ────────────────────────────────────────────────────────────────
  const [completado, setCompletado] = useState(false);
  const [puntajes, setPuntajes] = useState({
    socialResources:     0,
    economicResources:   0,
    mentalHealth:        0,
    physicalHealth:      0,
    capacityForSelfCare: 0,
  });

  // ── Preguntas del OARS ─────────────────────────────────────────────────────
  const preguntas = [
    {
      id: "social",
      titulo: "Recursos Sociales",
      descripcion: "¿Cuántas personas allegadas puede visitar o llamar?",
      campo: "socialResources",
    },
    {
      id: "economic",
      titulo: "Recursos Económicos",
      descripcion: "¿Tiene ingresos suficientes para sus necesidades?",
      campo: "economicResources",
    },
    {
      id: "mental",
      titulo: "Salud Mental",
      descripcion: "¿Se siente deprimido o ansioso?",
      campo: "mentalHealth",
    },
    {
      id: "physical",
      titulo: "Salud Física",
      descripcion: "¿Tiene problemas de movilidad?",
      campo: "physicalHealth",
    },
    {
      id: "selfcare",
      titulo: "Capacidad de Autocuidado",
      descripcion: "¿Puede realizar sus actividades diarias?",
      campo: "capacityForSelfCare",
    },
  ];

  // ── Actualizar puntaje individual ──────────────────────────────────────────
  const actualizarPuntaje = (campo, valor) => {
    setPuntajes((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // ── Finalizar prueba y guardar en Context ──────────────────────────────────
  const finalizarPrueba = () => {
    const puntajeTotal = Object.values(puntajes).reduce((a, b) => a + b, 0);
    const puntajeMax = 30;

    // Determinar interpretación
    let interpretacion = "";
    if (puntajeTotal >= 25) {
      interpretacion = "Normal";
    } else if (puntajeTotal >= 20) {
      interpretacion = "Deterioro leve";
    } else if (puntajeTotal >= 15) {
      interpretacion = "Deterioro moderado";
    } else {
      interpretacion = "Deterioro severo";
    }

    // ⭐ CREAR OBJETO RESULTADO ESTÁNDAR ⭐
    const resultado = {
      nombre:          "OARS", // ⭐ NOMBRE DE LA PRUEBA
      puntaje:         puntajeTotal,
      puntajeMax:      puntajeMax,
      interpretacion:  interpretacion,
      fecha:           new Date().toLocaleDateString("es-MX"),
      hora:            new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      detalles: {
        socialResources:     puntajes.socialResources,
        economicResources:   puntajes.economicResources,
        mentalHealth:        puntajes.mentalHealth,
        physicalHealth:      puntajes.physicalHealth,
        capacityForSelfCare: puntajes.capacityForSelfCare,
      },
    };

    // ⭐ GUARDAR COMO PRUEBA INDIVIDUAL EN CONTEXT ⭐
    // Parámetro 1: Nombre de la PRUEBA (no categoría)
    // Parámetro 2: Objeto con datos
    console.log("📊 Guardando OARS como prueba individual:", resultado);
    guardarResultadoPrueba("OARS", resultado);

    setCompletado(true);

    Alert.alert(
      "✅ Prueba OARS Completada",
      `Puntaje: ${puntajeTotal}/${puntajeMax}\nInterpretación: ${interpretacion}`,
      [
        {
          text: "Volver a Agendar Cita",
          onPress: () => {
            console.log("Volviendo a Agendar Cita...");
            setScreen("Agendar Cita");
          },
        },
      ]
    );
  };

  // ── Volver sin guardar ─────────────────────────────────────────────────────
  const volver = () => {
    Alert.alert(
      "Volver",
      "¿Deseas salir sin guardar los resultados?",
      [
        { text: "Continuar" },
        { text: "Salir", onPress: () => setScreen("Agendar Cita") },
      ]
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Encabezado */}
        <View style={s.header}>
          <Text style={s.titulo}>🧠 Evaluación OARS</Text>
          <Text style={s.subtitulo}>
            Older Americans Resources and Services
          </Text>
        </View>

        {/* Info paciente desde Context */}
        {citaEnProgreso?.nombre && (
          <View style={s.pacienteInfo}>
            <Text style={s.pacienteNombre}>👤 {citaEnProgreso.nombre}</Text>
            <Text style={s.pacienteTele}>📞 {citaEnProgreso.telefono}</Text>
          </View>
        )}

        {/* Preguntas */}
        <View style={s.preguntasContainer}>
          {preguntas.map((p, idx) => (
            <View key={p.id} style={s.preguntaCard}>
              <View style={s.preguntaHeader}>
                <Text style={s.preguntaNum}>Pregunta {idx + 1}</Text>
                <Text style={s.preguntaTitulo}>{p.titulo}</Text>
              </View>
              <Text style={s.preguntaDesc}>{p.descripcion}</Text>

              {/* Opciones de respuesta (0-6) */}
              <View style={s.opcionesRow}>
                {[0, 1, 2, 3, 4, 5, 6].map((valor) => (
                  <TouchableOpacity
                    key={valor}
                    style={[
                      s.opcionBtn,
                      puntajes[p.campo] === valor && s.opcionBtnActivo,
                    ]}
                    onPress={() => actualizarPuntaje(p.campo, valor)}
                  >
                    <Text
                      style={[
                        s.opcionBtnTxt,
                        puntajes[p.campo] === valor && s.opcionBtnTxtActivo,
                      ]}
                    >
                      {valor}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Resumen de puntajes */}
        <View style={s.resumenBox}>
          <Text style={s.resumenTitulo}>Resumen de Puntajes</Text>
          {Object.entries(puntajes).map(([campo, valor]) => (
            <View key={campo} style={s.resumenRow}>
              <Text style={s.resumenLabel}>{campo}</Text>
              <Text style={s.resumenValor}>{valor}/6</Text>
            </View>
          ))}
          <View style={[s.resumenRow, s.resumenTotal]}>
            <Text style={s.resumenLabel}>TOTAL</Text>
            <Text style={s.resumenValor}>
              {Object.values(puntajes).reduce((a, b) => a + b, 0)}/30
            </Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={s.accionesContainer}>
          <TouchableOpacity
            style={[s.boton, s.botonPrimario]}
            onPress={finalizarPrueba}
            disabled={completado}
          >
            <Text style={s.botonTxt}>✅ Finalizar y Guardar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.boton, s.botonSecundario]} onPress={volver}>
            <Text style={s.botonTxt}>↩️ Volver sin Guardar</Text>
          </TouchableOpacity>
        </View>

        {/* Mensaje de éxito */}
        {completado && (
          <View style={s.successBox}>
            <Text style={s.successTxt}>
              ✅ Resultado guardado. Redirigiendo a "Agendar Cita"...
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:           { flex: 1, backgroundColor: "#EEF2F7" },
  content:             { padding: 16, paddingBottom: 30 },

  header:              { backgroundColor: "#1565C0", borderRadius: 12, padding: 16,
                         marginBottom: 16 },
  titulo:              { fontSize: 20, fontWeight: "800", color: "#fff", marginBottom: 4 },
  subtitulo:           { fontSize: 12, color: "#E3F2FD" },

  pacienteInfo:        { backgroundColor: "#E3F2FD", borderRadius: 10, padding: 12,
                         marginBottom: 16, elevation: 2 },
  pacienteNombre:      { fontSize: 14, fontWeight: "700", color: "#0D47A1" },
  pacienteTele:        { fontSize: 12, color: "#1565C0", marginTop: 4 },

  preguntasContainer:  { marginBottom: 16 },
  preguntaCard:        { backgroundColor: "#fff", borderRadius: 12, padding: 14,
                         marginBottom: 12, elevation: 2 },
  preguntaHeader:      { marginBottom: 8 },
  preguntaNum:         { fontSize: 11, color: "#1565C0", fontWeight: "700" },
  preguntaTitulo:      { fontSize: 14, fontWeight: "700", color: "#333", marginTop: 4 },
  preguntaDesc:        { fontSize: 12, color: "#666", marginBottom: 12 },

  opcionesRow:         { flexDirection: "row", gap: 6 },
  opcionBtn:           { flex: 1, paddingVertical: 10, borderRadius: 8,
                         backgroundColor: "#F5F5F5", alignItems: "center",
                         borderWidth: 1.5, borderColor: "#ddd" },
  opcionBtnActivo:     { backgroundColor: "#1565C0", borderColor: "#1565C0" },
  opcionBtnTxt:        { fontWeight: "700", fontSize: 12, color: "#555" },
  opcionBtnTxtActivo:  { color: "#fff" },

  resumenBox:          { backgroundColor: "#fff", borderRadius: 12, padding: 14,
                         marginBottom: 16, elevation: 2, borderLeftWidth: 4,
                         borderLeftColor: "#1565C0" },
  resumenTitulo:       { fontSize: 14, fontWeight: "800", color: "#1565C0",
                         marginBottom: 10 },
  resumenRow:          { flexDirection: "row", justifyContent: "space-between",
                         paddingVertical: 6, borderBottomWidth: 0.5,
                         borderBottomColor: "#eee" },
  resumenLabel:        { fontSize: 12, color: "#333", fontWeight: "600" },
  resumenValor:        { fontSize: 13, fontWeight: "800", color: "#1565C0" },
  resumenTotal:        { borderBottomWidth: 0, paddingTop: 10, marginTop: 6,
                         borderTopWidth: 1.5, borderTopColor: "#1565C0",
                         backgroundColor: "#E3F2FD" },

  accionesContainer:   { gap: 10, marginBottom: 16 },
  boton:               { padding: 14, borderRadius: 10, alignItems: "center" },
  botonPrimario:       { backgroundColor: "#2E7D32" },
  botonSecundario:     { backgroundColor: "#666" },
  botonTxt:            { color: "#fff", fontWeight: "700", fontSize: 14 },

  successBox:          { backgroundColor: "#E8F5E9", borderRadius: 10, padding: 12,
                         borderLeftWidth: 4, borderLeftColor: "#2E7D32" },
  successTxt:          { color: "#2E7D32", fontWeight: "700", fontSize: 12 },
});
