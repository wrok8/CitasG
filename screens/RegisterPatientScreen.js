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
    };

    const [form, setForm] = useState(formInicial);

    // Cargar datos si está editando, si no, limpiar
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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>Datos del Paciente</Text>

        <Text style={styles.label}>Paciente</Text>
        <TextInput
          style={styles.input}
          placeholder="Escriba nombre del paciente"
          placeholderTextColor="#90A4AE"
          value={form.nombre}
          onChangeText={(t) => setForm({ ...form, nombre: t })}
        />

        <Text style={styles.label}>Contacto</Text>
        <TextInput
          style={styles.input}
          placeholder="Escriba nombre del contacto"
          placeholderTextColor="#90A4AE"
          value={form.contacto}
          onChangeText={(t) => setForm({ ...form, contacto: t })}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="usuario@gmail.com"
          placeholderTextColor="#90A4AE"
          value={form.email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(t) => setForm({ ...form, email: t })}
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 5551234567"
          placeholderTextColor="#90A4AE"
          value={form.telefono}
          keyboardType="phone-pad"
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
          placeholderTextColor="#90A4AE"
          multiline
          value={form.sintomas}
          onChangeText={(t) => setForm({ ...form, sintomas: t })}
        />

        <Text style={styles.subtitle}>Evaluaciones Geriátricas</Text>

        {Object.keys(form.evaluaciones).map((key) => (
          <View key={key} style={styles.switchRow}>
            <Text>{key}</Text>
            <Switch
              value={form.evaluaciones[key]}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  evaluaciones: { ...form.evaluaciones, [key]: v },
                })
              }
              trackColor={{ true: "#1565C0" }}
            />
          </View>
        ))}

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
    marginTop: 25,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});