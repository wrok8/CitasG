/**
 * RegisterPatientScreen.js - CON PRUEBAS INDIVIDUALES
 * 
 * Ahora muestra cada prueba realizada de forma individual:
 * ✅ OARS: 21 pts
 * ✅ GDS-15: 10 pts
 * ✅ Katz: 6 pts
 */

import React, { useState, useEffect, useContext } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
  Platform,
  Alert,
} from "react-native";

import { ref, push } from "firebase/database";
import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { registrarMovimiento, initBitacora } from "../utils/bitacora";
import { EvaluationContext } from "../context/EvaluationContext";

export default function RegisterPatientScreen({
  setScreen,
  setPacienteActual,
  pacienteActual,
}) {
  // ── Context ────────────────────────────────────────────────────────────────
  const evaluationContext = useContext(EvaluationContext);
  const {
    citaEnProgreso,
    actualizarDatosCita,
    toggleEvaluacion,
    obtenerTodasLasPruebas,
    limpiarCitaEnProgreso,
  } = evaluationContext;

  // ── Estado local ───────────────────────────────────────────────────────────
  const [usuarios, setUsuarios]                   = useState([]);
  const [showDatePicker, setShowDatePicker]       = useState(false);
  const [showTimePicker, setShowTimePicker]       = useState(false);
  const [usuarioActual, setUsuarioActual]         = useState("Sistema");

  const STORAGE_KEY   = "@usuarios_app";
  const USER_SELECTED = "@usuario_seleccionado";

  // ── Ciclo de vida ──────────────────────────────────────────────────────────

  useEffect(() => {
    initBitacora();
    cargarUsuarios();
    cargarUsuarioSeleccionado();
  }, []);

  // ── Cargar usuarios de Firebase ────────────────────────────────────────────

  const cargarUsuarios = () => {
    const { ref: dbRef, onValue } = require("firebase/database");
    const usuariosRef = dbRef(db, "usuarios");
    onValue(usuariosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setUsuarios(lista);
      } else {
        setUsuarios([]);
      }
    });
  };

  const cargarUsuarioSeleccionado = async () => {
    try {
      const data = await AsyncStorage.getItem(USER_SELECTED);
      if (data) {
        const usuario = JSON.parse(data);
        setUsuarioActual(usuario.nombre || "Sistema");
        actualizarDatosCita({
          nombre:   usuario.nombre,
          contacto: usuario.correo,
          email:    usuario.correo,
          telefono: usuario.telefono,
        });
      }
    } catch (_) {
      Alert.alert("Error", "No se pudo cargar el usuario seleccionado");
    }
  };

  // ── Seleccionar usuario (paciente) ─────────────────────────────────────────

  const seleccionarUsuario = (usuario) => {
    actualizarDatosCita({
      nombre:   usuario.nombre,
      contacto: usuario.correo,
      email:    usuario.correo,
      telefono: usuario.telefono,
    });
  };

  // ── Manejadores de fecha y hora ────────────────────────────────────────────

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || citaEnProgreso.fecha;
    setShowDatePicker(Platform.OS === "ios");
    actualizarDatosCita({ fecha: currentDate });
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || citaEnProgreso.hora;
    setShowTimePicker(Platform.OS === "ios");
    actualizarDatosCita({ hora: currentTime });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("es-MX");
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  // ── Agendar cita (guardar en Firebase) ──────────────────────────────────────

  const handleSubmit = async () => {
    // Validaciones
    if (!citaEnProgreso.nombre || !citaEnProgreso.telefono) {
      Alert.alert("Error", "Debes seleccionar un paciente");
      return;
    }
    if (!citaEnProgreso.medico) {
      Alert.alert("Error", "Ingresa el nombre del médico");
      return;
    }

    // Obtener todas las pruebas realizadas
    const todasLasPruebas = obtenerTodasLasPruebas();
    const evaluacionesActivas = Object.keys(citaEnProgreso.evaluacionesActivas).filter(
      (key) => citaEnProgreso.evaluacionesActivas[key]
    );

    // Objeto de cita completo
    const nuevaCita = {
      // Identificación
      pacienteId:         citaEnProgreso.telefono,
      nombre:             citaEnProgreso.nombre,
      contacto:           citaEnProgreso.contacto,
      email:              citaEnProgreso.email,
      telefono:           citaEnProgreso.telefono,
      medico:             citaEnProgreso.medico,
      centroGeriatrico:   citaEnProgreso.centroGeriatrico,

      // Fecha y hora
      fecha:              citaEnProgreso.fecha.toISOString(),
      hora:               formatTime(citaEnProgreso.hora),

      // Motivo y síntomas
      motivo:             citaEnProgreso.motivo,
      sintomas:           citaEnProgreso.sintomas,

      // Evaluaciones realizadas
      evaluacionesActivas: evaluacionesActivas,
      
      // ⭐ PRUEBAS INDIVIDUALES CON PUNTAJES ⭐
      evaluacionesResultados: citaEnProgreso.evaluacionesResultados,
      
      // Resumen de pruebas para vista rápida
      resumenPruebas: todasLasPruebas.map((p) => ({
        nombre: p.nombre,
        puntaje: p.puntaje,
        puntajeMax: p.puntajeMax,
        interpretacion: p.interpretacion,
      })),

      // Estado
      status:             "agendada",
      observaciones:      "",
      archivoObservaciones: null,

      // Metadata
      creadoEn:           new Date().toISOString(),
      actualizadoEn:      new Date().toISOString(),
    };

    try {
      // Guardar en Firebase
      await push(ref(db, "citasD"), nuevaCita);

      // Registrar en bitácora con detalle de pruebas
      const pruebrasStr = todasLasPruebas.length > 0
        ? ` Pruebas: ${todasLasPruebas.map((p) => `${p.nombre}(${p.puntaje}pts)`).join(", ")}`
        : "";
      await registrarMovimiento(
        usuarioActual,
        "cita",
        `Cita agendada para ${citaEnProgreso.nombre} con ${citaEnProgreso.medico} el ${formatDate(citaEnProgreso.fecha)}.${pruebrasStr}`
      );

      // Setear paciente actual para otros usos
      setPacienteActual(nuevaCita);

      // Limpiar el contexto de cita en progreso
      limpiarCitaEnProgreso();

      // Mensaje de éxito con detalle de pruebas
      const detallesPruebas = todasLasPruebas.length > 0
        ? `\n\nPruebas realizadas:\n${todasLasPruebas.map((p) => `• ${p.nombre}: ${p.puntaje}/${p.puntajeMax} pts`).join("\n")}`
        : "";

      Alert.alert(
        "✅ Cita agendada exitosamente",
        `Paciente: ${citaEnProgreso.nombre}\nMédico: ${citaEnProgreso.medico}\nFecha: ${formatDate(citaEnProgreso.fecha)}${detallesPruebas}`,
        [
          { text: "Ver Resumen", onPress: () => setScreen("Resumen") },
          { text: "OK" },
        ]
      );
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la cita en Firebase");
      console.error(e);
    }
  };

  // ── Navegar a menú de evaluación ───────────────────────────────────────────

  const handleNavigate = (screenName) => {
    setScreen(screenName);
  };

  // ── Obtener todas las pruebas para mostrar ─────────────────────────────────

  const todasLasPruebas = obtenerTodasLasPruebas();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Banner paciente activo */}
        {citaEnProgreso.nombre !== "" && (
          <View style={styles.pacienteActivo}>
            <Text style={styles.pacienteTexto}>👤 Paciente: {citaEnProgreso.nombre}</Text>
          </View>
        )}

        {/* ── Selección de usuario ── */}
        <Text style={styles.subtitle}>Seleccionar Paciente</Text>
        {usuarios.map((u) => (
          <TouchableOpacity
            key={u.id}
            style={[
              styles.userCard,
              citaEnProgreso.telefono === u.telefono && styles.userCardSelected,
            ]}
            onPress={() => seleccionarUsuario(u)}
          >
            <Text style={styles.userName}>{u.nombre}</Text>
            <Text style={styles.userSub}>📧 {u.correo}</Text>
            <Text style={styles.userSub}>📞 {u.telefono}</Text>
          </TouchableOpacity>
        ))}

        {/* ── Datos del paciente (solo lectura) ── */}
        <Text style={styles.subtitle}>Datos del Paciente</Text>

        <Field label="Paciente"  value={citaEnProgreso.nombre}   />
        <Field label="Contacto"  value={citaEnProgreso.contacto} />
        <Field label="Email"     value={citaEnProgreso.email}    />
        <Field label="Teléfono"  value={citaEnProgreso.telefono} />

        {/* ── Datos de la cita ── */}
        <Text style={styles.subtitle}>Datos de la Cita</Text>

        <Text style={styles.label}>Médico *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del médico"
          value={citaEnProgreso.medico}
          onChangeText={(t) => actualizarDatosCita({ medico: t })}
        />

        <Text style={styles.label}>Centro Geriátrico</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del centro"
          value={citaEnProgreso.centroGeriatrico}
          onChangeText={(t) => actualizarDatosCita({ centroGeriatrico: t })}
        />

        <Text style={styles.label}>Motivo de la cita</Text>
        <TextInput
          style={styles.input}
          placeholder="Motivo principal"
          value={citaEnProgreso.motivo}
          onChangeText={(t) => actualizarDatosCita({ motivo: t })}
        />

        {/* Fecha */}
        <Text style={styles.label}>Fecha de Cita</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>📅  {formatDate(citaEnProgreso.fecha)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={new Date(citaEnProgreso.fecha)}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        {/* Hora */}
        <Text style={styles.label}>Hora de Cita</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.dateText}>🕐  {formatTime(citaEnProgreso.hora)}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={new Date(citaEnProgreso.hora)}
            mode="time"
            display="default"
            onChange={onChangeTime}
          />
        )}

        {/* Síntomas */}
        <Text style={styles.label}>Síntomas / Notas</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describa los síntomas del paciente"
          multiline
          value={citaEnProgreso.sintomas}
          onChangeText={(t) => actualizarDatosCita({ sintomas: t })}
        />

        {/* ── Evaluaciones geriátricas ── */}
        <Text style={styles.subtitle}>Evaluaciones Geriátricas</Text>

        {[
          { key: "Cognitivo",      screen: "CognitivoMenu",      icon: "🧠" },
          { key: "Afectivo",       screen: "AfectivoMenu",       icon: "❤️" },
          { key: "Funcionamiento", screen: "FuncionamientoMenu", icon: "🚶" },
          { key: "Nutricional",    screen: "NutricionalMenu",    icon: "🍽️" },
          { key: "Entorno",        screen: "EntornoMenu",        icon: "🏠" },
        ].map(({ key, screen: scr, icon }) => (
          <View key={key}>
            <View style={styles.switchRow}>
              <Text style={styles.switchIcon}>{icon}</Text>
              <Text style={styles.switchLabel}>{key}</Text>
              <Switch
                value={citaEnProgreso.evaluacionesActivas[key]}
                onValueChange={(v) => toggleEvaluacion(key, v)}
                trackColor={{ true: "#1565C0" }}
              />
            </View>

            {citaEnProgreso.evaluacionesActivas[key] && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => handleNavigate(scr)}
              >
                <Text style={styles.buttonText}>
                  {icon} IR A {key.toUpperCase()} MENU
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* ⭐ RESUMEN DE PRUEBAS INDIVIDUALES ⭐ */}
        {todasLasPruebas.length > 0 && (
          <View style={styles.resumenPruebas}>
            <Text style={styles.resumenTitulo}>📊 Pruebas Realizadas</Text>
            {todasLasPruebas.map((prueba, idx) => (
              <View key={idx} style={styles.pruebaItem}>
                <View style={styles.pruebaTop}>
                  <Text style={styles.pruebaNombre}>{prueba.nombre}</Text>
                  <Text style={[styles.pruebaPuntaje, { color: obtenerColorPuntaje(prueba) }]}>
                    {prueba.puntaje}/{prueba.puntajeMax} pts
                  </Text>
                </View>
                {prueba.interpretacion && (
                  <Text style={styles.pruebaInterpretacion}>
                    {prueba.interpretacion}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── Acciones principales ── */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>📅 AGENDAR CITA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#6A1B9A", marginTop: 10 }]}
          onPress={() => setScreen("ControlCitas")}
        >
          <Text style={styles.buttonText}>📋 VER CONTROL DE CITAS</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Componente auxiliar: Campo de solo lectura ───────────────────────────────

function Field({ label, value }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, styles.inputReadonly]}
        value={value}
        editable={false}
      />
    </>
  );
}

// ── Helper: Obtener color según puntaje ────────────────────────────────────

function obtenerColorPuntaje(prueba) {
  if (!prueba.puntaje || !prueba.puntajeMax) return "#333";
  const porcentaje = (prueba.puntaje / prueba.puntajeMax) * 100;
  if (porcentaje >= 80) return "#2E7D32"; // Verde: bien
  if (porcentaje >= 50) return "#F57F17"; // Naranja: medio
  return "#B71C1C"; // Rojo: bajo
}

// ── Estilos ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:           { padding: 20 },

  pacienteActivo:      { backgroundColor: "#E3F2FD", padding: 12, borderRadius: 10, marginBottom: 15 },
  pacienteTexto:       { fontWeight: "bold", color: "#0D47A1", fontSize: 14 },

  subtitle:            { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#0D47A1" },

  label:               { marginTop: 12, fontWeight: "bold", color: "#1565C0", fontSize: 13 },
  input:               { borderWidth: 1, borderColor: "#1565C0", borderRadius: 10, padding: 12, marginTop: 5, fontSize: 13 },
  inputReadonly:       { backgroundColor: "#F5F5F5", color: "#555" },
  textArea:            { height: 100, textAlignVertical: "top" },

  dateButton:          { borderWidth: 1, borderColor: "#1565C0", padding: 15, borderRadius: 10,
                         backgroundColor: "#E3F2FD", marginTop: 5 },
  dateText:            { fontSize: 16, color: "#0D47A1" },

  switchRow:           { flexDirection: "row", justifyContent: "space-between",
                         alignItems: "center", marginVertical: 10, paddingHorizontal: 4 },
  switchIcon:          { fontSize: 20 },
  switchLabel:         { fontSize: 15, fontWeight: "600", color: "#333", flex: 1, marginLeft: 10 },

  button:              { backgroundColor: "#1565C0", padding: 16, borderRadius: 12, marginTop: 15 },
  secondaryButton:     { backgroundColor: "#2E7D32", marginTop: 8 },
  buttonText:          { color: "white", textAlign: "center", fontWeight: "bold", fontSize: 14 },

  userCard:            { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 10, marginBottom: 8 },
  userCardSelected:    { borderColor: "#1565C0", backgroundColor: "#E3F2FD", borderWidth: 2 },
  userName:            { fontWeight: "bold", fontSize: 16, color: "#0D47A1" },
  userSub:             { color: "#555", fontSize: 13, marginTop: 2 },

  // ⭐ Estilos para resumen de pruebas individuales
  resumenPruebas:      { backgroundColor: "#E8F5E9", borderRadius: 12, padding: 14,
                         marginTop: 20, marginBottom: 10, borderWidth: 1, borderColor: "#81C784" },
  resumenTitulo:       { fontSize: 14, fontWeight: "800", color: "#2E7D32", marginBottom: 10 },
  pruebaItem:          { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 8,
                         borderLeftWidth: 4, borderLeftColor: "#2E7D32", elevation: 1 },
  pruebaTop:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pruebaNombre:        { fontSize: 14, fontWeight: "700", color: "#333", flex: 1 },
  pruebaPuntaje:       { fontSize: 15, fontWeight: "800", marginLeft: 10 },
  pruebaInterpretacion:{ fontSize: 12, color: "#666", marginTop: 4, fontStyle: "italic" },
});