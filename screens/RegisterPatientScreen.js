import React, { useState, useEffect } from "react";
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

import { ref, onValue, push } from "firebase/database";
import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { registrarMovimiento, initBitacora } from "../utils/bitacora";

export default function RegisterPatientScreen({
  setScreen,
  setPacienteActual,
  pacienteActual,
}) {
  const STORAGE_KEY = "@usuarios_app";
  const USER_SELECTED = "@usuario_seleccionado";

  const [usuarios, setUsuarios] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState("Sistema");

  const formInicial = {
    nombre: "",
    contacto: "",
    email: "",
    telefono: "",
    fecha: new Date(),
    hora: new Date(),
    sintomas: "",
    motivo: "",
    medico: "",
    centroGeriatrico: "",
    evaluaciones: {
      Cognitivo: false,
      Afectivo: false,
      Funcionamiento: false,
      Nutricional: false,
      Entorno: false,
    },
  };

  const [form, setForm] = useState(formInicial);

  useEffect(() => {
    initBitacora();
    cargarUsuarios();
    cargarUsuarioSeleccionado();
  }, []);

  const cargarUsuarios = () => {
    const usuariosRef = ref(db, "usuarios");
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
        setForm((prev) => ({
          ...prev,
          nombre: usuario.nombre,
          contacto: usuario.correo,
          email: usuario.correo,
          telefono: usuario.telefono,
        }));
      }
    } catch (_) {
      Alert.alert("Error", "No se pudo cargar el usuario seleccionado");
    }
  };

  const seleccionarUsuario = (usuario) => {
    setForm({
      ...form,
      nombre: usuario.nombre,
      contacto: usuario.correo,
      email: usuario.correo,
      telefono: usuario.telefono,
    });
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || form.fecha;
    setShowDatePicker(Platform.OS === "ios");
    setForm({ ...form, fecha: currentDate });
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || form.hora;
    setShowTimePicker(Platform.OS === "ios");
    setForm({ ...form, hora: currentTime });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("es-MX");
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  const handleSubmit = async () => {
    if (!form.nombre || !form.telefono) {
      Alert.alert("Error", "Debes seleccionar un paciente");
      return;
    }
    if (!form.medico) {
      Alert.alert("Error", "Ingresa el nombre del médico");
      return;
    }

    const nuevaCita = {
      pacienteId: form.telefono,
      nombre: form.nombre,
      contacto: form.contacto,
      email: form.email,
      telefono: form.telefono,
      medico: form.medico,
      centroGeriatrico: form.centroGeriatrico,
      fecha: form.fecha.toISOString(),
      hora: formatTime(form.hora),
      motivo: form.motivo,
      sintomas: form.sintomas,
      evaluaciones: form.evaluaciones,
      status: "agendada",
      observaciones: "",
      archivoObservaciones: null,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };

    try {
      await push(ref(db, "citasD"), nuevaCita);

      await registrarMovimiento(
        usuarioActual,
        "cita",
        `Cita agendada para ${form.nombre} con ${form.medico} el ${formatDate(form.fecha)} ${formatTime(form.hora)}`
      );

      setPacienteActual(nuevaCita);
      Alert.alert("Cita agendada", `Cita registrada para ${form.nombre}`, [
        { text: "Ver Resumen", onPress: () => setScreen("Resumen") },
        { text: "OK" },
      ]);
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la cita en Firebase");
      console.error(e);
    }
  };

  const handleNavigate = (screenName) => {
    setPacienteActual(form);
    setScreen(screenName);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {form.nombre !== "" && (
          <View style={styles.pacienteActivo}>
            <Text style={styles.pacienteTexto}>Paciente: {form.nombre}</Text>
          </View>
        )}

        <Text style={styles.subtitle}>Seleccionar Paciente</Text>
        {usuarios.map((u) => (
          <TouchableOpacity
            key={u.id}
            style={[
              styles.userCard,
              form.telefono === u.telefono && styles.userCardSelected,
            ]}
            onPress={() => seleccionarUsuario(u)}
          >
            <Text style={styles.userName}>{u.nombre}</Text>
            <Text style={styles.userSub}>{u.correo}</Text>
            <Text style={styles.userSub}>{u.telefono}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.subtitle}>Datos del Paciente</Text>

        <Field label="Paciente" value={form.nombre} />
        <Field label="Contacto" value={form.contacto} />
        <Field label="Email" value={form.email} />
        <Field label="Teléfono" value={form.telefono} />

        <Text style={styles.subtitle}>Datos de la Cita</Text>

        <Text style={styles.label}>Médico *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del médico"
          value={form.medico}
          onChangeText={(t) => setForm({ ...form, medico: t })}
        />

        <Text style={styles.label}>Centro Geriátrico</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del centro"
          value={form.centroGeriatrico}
          onChangeText={(t) => setForm({ ...form, centroGeriatrico: t })}
        />

        <Text style={styles.label}>Motivo de la cita</Text>
        <TextInput
          style={styles.input}
          placeholder="Motivo principal"
          value={form.motivo}
          onChangeText={(t) => setForm({ ...form, motivo: t })}
        />

        <Text style={styles.label}>Fecha de Cita</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{formatDate(form.fecha)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={new Date(form.fecha)}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        <Text style={styles.label}>Hora de Cita</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.dateText}>{formatTime(form.hora)}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={new Date(form.hora)}
            mode="time"
            display="default"
            onChange={onChangeTime}
          />
        )}

        <Text style={styles.label}>Síntomas / Notas</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describa los síntomas del paciente"
          multiline
          value={form.sintomas}
          onChangeText={(t) => setForm({ ...form, sintomas: t })}
        />

        <Text style={styles.subtitle}>Evaluaciones Geriátricas</Text>

        {[
          { key: "Cognitivo", screen: "CognitivoMenu" },
          { key: "Afectivo", screen: "AfectivoMenu" },
          { key: "Funcionamiento", screen: "FuncionamientoMenu" },
          { key: "Nutricional", screen: "NutricionalMenu" },
          { key: "Entorno", screen: "EntornoMenu" },
        ].map(({ key, screen: scr }) => (
          <View key={key}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{key}</Text>
              <Switch
                value={form.evaluaciones[key]}
                onValueChange={(v) =>
                  setForm({ ...form, evaluaciones: { ...form.evaluaciones, [key]: v } })
                }
                trackColor={{ true: "#1565C0" }}
              />
            </View>
            {form.evaluaciones[key] && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => handleNavigate(scr)}
              >
                <Text style={styles.buttonText}>IR A {key.toUpperCase()} MENU</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>AGENDAR CITA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#6A1B9A", marginTop: 10 }]}
          onPress={() => setScreen("ControlCitas")}
        >
          <Text style={styles.buttonText}>VER CONTROL DE CITAS</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Field({ label, value }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, styles.inputReadonly]} value={value} editable={false} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  pacienteActivo: { backgroundColor: "#E3F2FD", padding: 12, borderRadius: 10, marginBottom: 15 },
  pacienteTexto: { fontWeight: "bold", color: "#0D47A1" },
  subtitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#0D47A1" },
  label: { marginTop: 12, fontWeight: "bold", color: "#1565C0" },
  input: { borderWidth: 1, borderColor: "#1565C0", borderRadius: 10, padding: 12, marginTop: 5 },
  inputReadonly: { backgroundColor: "#F5F5F5", color: "#555" },
  textArea: { height: 100, textAlignVertical: "top" },
  dateButton: {
    borderWidth: 1,
    borderColor: "#1565C0",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#E3F2FD",
    marginTop: 5,
  },
  dateText: { fontSize: 16 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  switchLabel: { fontSize: 15, color: "#333" },
  button: { backgroundColor: "#1565C0", padding: 16, borderRadius: 12, marginTop: 15 },
  secondaryButton: { backgroundColor: "#2E7D32" },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold", fontSize: 14 },
  userCard: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 10, marginBottom: 8 },
  userCardSelected: { borderColor: "#1565C0", backgroundColor: "#E3F2FD", borderWidth: 2 },
  userName: { fontWeight: "bold", fontSize: 16, color: "#0D47A1" },
  userSub: { color: "#555", fontSize: 13, marginTop: 2 },
});