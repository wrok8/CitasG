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
import DateTimePicker from "@react-native-community/datetimepicker";

export default function RegisterPatientScreen({
  setScreen,
  setPacienteActual,
  pacienteActual,
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
const [gds15, setGds15] = useState(null);
const formInicial = {
    nombre: "",
    contacto: "",
    email: "",
    telefono: "",
    fecha: new Date(),
    sintomas: "",
    evaluaciones: {
      Cognitivo: false,
      Afectivo: false,
      Funcionamiento: false,
      Nutricional: false,
      Entorno: false,
    },
    pruebas: [],   
  };

  const [form, setForm] = useState(formInicial);

  useEffect(() => {
    if (pacienteActual) {
      setForm(pacienteActual);
    } else {
      setForm(formInicial);
    }
  }, [pacienteActual]);

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || form.fecha;
    setShowDatePicker(Platform.OS === "ios");
    setForm({ ...form, fecha: currentDate });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleSubmit = () => {
    if (!form.nombre || !form.telefono) {
      Alert.alert("Error", "Nombre y teléfono son obligatorios");
      return;
    }

    setPacienteActual(form);
    setScreen("Resumen");
  };

  const handleNavigate = (screenName) => {
    setPacienteActual(form);
    setScreen(screenName);
  };

  const guardarPaciente = () => {
  if (!pacienteActual?.nombre) {
    Alert.alert("Error", "Debe ingresar el nombre del paciente");
    return;
  }

    setPacientes((prevPacientes) => {
      // Verificar si ya existe (modo edición)
      const existe = prevPacientes.find(
        (p) => p === pacienteActual
      );

      if (existe) {
        // Si existe, actualizarlo
        return prevPacientes.map((p) =>
          p === pacienteActual ? pacienteActual : p
        );
      } else {
        // Si no existe, agregarlo
        return [...prevPacientes, pacienteActual];
      }
    });

    Alert.alert("Éxito", "Paciente guardado correctamente");

    setScreen("Lista de Pacientes");
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>Datos del Paciente</Text>

        <Text style={styles.label}>Paciente</Text>
        <TextInput
          style={styles.input}
          placeholder="Escriba nombre del paciente"
          value={form.nombre}
          onChangeText={(t) => setForm({ ...form, nombre: t })}
        />

        <Text style={styles.label}>Contacto</Text>
        <TextInput
          style={styles.input}
          placeholder="Escriba nombre del contacto"
          value={form.contacto}
          onChangeText={(t) => setForm({ ...form, contacto: t })}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="usuario@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 5551234567"
          keyboardType="phone-pad"
          value={form.telefono}
          onChangeText={(t) => setForm({ ...form, telefono: t })}
        />

        <Text style={styles.label}>Fecha de Cita</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
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

        <Text style={styles.label}>Síntomas</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describa los síntomas del paciente"
          multiline
          value={form.sintomas}
          onChangeText={(t) => setForm({ ...form, sintomas: t })}
        />

        <Text style={styles.subtitle}>Evaluaciones Geriátricas</Text>

        {/* COGNITIVO */}
        <View style={styles.switchRow}>
          <Text>Cognitivo</Text>
          <Switch
            value={form.evaluaciones.Cognitivo}
            onValueChange={(v) =>
              setForm({
                ...form,
                evaluaciones: { ...form.evaluaciones, Cognitivo: v },
              })
            }
            trackColor={{ true: "#1565C0" }}
          />
        </View>

        {form.evaluaciones.Cognitivo && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handleNavigate("CognitivoMenu")}
          >
            <Text style={styles.buttonText}>IR A COGNITIVO MENU</Text>
          </TouchableOpacity>
        )}

        {/* AFECTIVO */}
        <View style={styles.switchRow}>
          <Text>Afectivo</Text>
          <Switch
            value={form.evaluaciones.Afectivo}
            onValueChange={(v) =>
              setForm({
                ...form,
                evaluaciones: { ...form.evaluaciones, Afectivo: v },
              })
            }
            trackColor={{ true: "#1565C0" }}
          />
        </View>

        {form.evaluaciones.Afectivo && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handleNavigate("AfectivoMenu")}
          >
            <Text style={styles.buttonText}>IR A AFECTIVO MENU</Text>
          </TouchableOpacity>
        )}

        {/* FUNCIONAMIENTO */}
        <View style={styles.switchRow}>
          <Text>Funcionamiento</Text>
          <Switch
            value={form.evaluaciones.Funcionamiento}
            onValueChange={(v) =>
              setForm({
                ...form,
                evaluaciones: {
                  ...form.evaluaciones,
                  Funcionamiento: v,
                },
              })
            }
            trackColor={{ true: "#1565C0" }}
          />
        </View>

        {form.evaluaciones.Funcionamiento && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handleNavigate("FuncionamientoMenu")}
          >
            <Text style={styles.buttonText}>IR A FUNCIONAMIENTO MENU</Text>
          </TouchableOpacity>
        )}

        {/* NUTRICIONAL */}
        <View style={styles.switchRow}>
          <Text>Nutricional</Text>
          <Switch
            value={form.evaluaciones.Nutricional}
            onValueChange={(v) =>
              setForm({
                ...form,
                evaluaciones: { ...form.evaluaciones, Nutricional: v },
              })
            }
            trackColor={{ true: "#1565C0" }}
          />
        </View>

        {form.evaluaciones.Nutricional && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handleNavigate("NutricionalMenu")}
          >
            <Text style={styles.buttonText}>IR A NUTRICIONAL MENU</Text>
          </TouchableOpacity>
        )}

        {/* ENTORNO */}
        <View style={styles.switchRow}>
          <Text>Entorno</Text>
          <Switch
            value={form.evaluaciones.Entorno}
            onValueChange={(v) =>
              setForm({
                ...form,
                evaluaciones: { ...form.evaluaciones, Entorno: v },
              })
            }
            trackColor={{ true: "#1565C0" }}
          />
        </View>

        {form.evaluaciones.Entorno && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handleNavigate("EntornoMenu")}
          >
            <Text style={styles.buttonText}>IR A ENTORNO MENU</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>VER RESUMEN</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#0D47A1",
  },
  label: { marginTop: 15, fontWeight: "bold", color: "#1565C0" },
  input: {
    borderWidth: 1,
    borderColor: "#1565C0",
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
  },
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
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#1565C0",
    padding: 18,
    borderRadius: 12,
    marginTop: 15,
  },
  secondaryButton: {
    backgroundColor: "#2E7D32",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});