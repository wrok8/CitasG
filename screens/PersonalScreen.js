import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

export default function PersonalScreen({ setScreen }) {
  const formInicial = {
    nombre: "",
    cedula: "",
    especialidad: "",
    turno: "",
    telefono: "",
    correo: "",
    areaActiva: false,
    areaServicio: "",
  };

  const [form, setForm] = useState(formInicial);

  const guardarPersonal = () => {
    if (!form.nombre || !form.cedula || !form.telefono) {
      Alert.alert("Error", "Nombre, cédula y teléfono son obligatorios");
      return;
    }

    Alert.alert("Éxito", "Personal registrado correctamente");

    console.log("Datos personal:", form);
  };

  const borrarTodo = () => {
    Alert.alert("Confirmar", "¿Desea borrar todo?", [
      { text: "Cancelar" },
      {
        text: "Sí",
        onPress: () => setForm(formInicial),
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>Registro de Personal</Text>

        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={form.nombre}
          onChangeText={(t) => setForm({ ...form, nombre: t })}
        />

        <Text style={styles.label}>Cédula Profesional</Text>
        <TextInput
          style={styles.input}
          placeholder="Número de cédula"
          keyboardType="numeric"
          value={form.cedula}
          onChangeText={(t) => setForm({ ...form, cedula: t })}
        />

        <Text style={styles.label}>Especialidad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Geriatría"
          value={form.especialidad}
          onChangeText={(t) => setForm({ ...form, especialidad: t })}
        />

        <Text style={styles.subtitle}>Turno</Text>

        <View style={styles.turnoContainer}>
          <TouchableOpacity
            style={[
              styles.turnoButton,
              form.turno === "Matutino" && styles.turnoActivo,
            ]}
            onPress={() => setForm({ ...form, turno: "Matutino" })}
          >
            <Text style={styles.turnoText}>Matutino</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.turnoButton,
              form.turno === "Vespertino" && styles.turnoActivo,
            ]}
            onPress={() => setForm({ ...form, turno: "Vespertino" })}
          >
            <Text style={styles.turnoText}>Vespertino</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.turnoButton,
              form.turno === "Nocturno" && styles.turnoActivo,
            ]}
            onPress={() => setForm({ ...form, turno: "Nocturno" })}
          >
            <Text style={styles.turnoText}>Nocturno</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="10 dígitos"
          keyboardType="phone-pad"
          maxLength={10}
          value={form.telefono}
          onChangeText={(t) => setForm({ ...form, telefono: t })}
        />

        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.correo}
          onChangeText={(t) => setForm({ ...form, correo: t })}
        />

        <Text style={styles.subtitle}>Área / Servicio</Text>

        <View style={styles.switchRow}>
          <Text>Asignar área o servicio</Text>
          <Switch
            value={form.areaActiva}
            onValueChange={(v) =>
              setForm({ ...form, areaActiva: v })
            }
            trackColor={{ true: "#1565C0" }}
          />
        </View>

        {form.areaActiva && (
          <TextInput
            style={styles.input}
            placeholder="Ej. Consulta externa, Urgencias..."
            value={form.areaServicio}
            onChangeText={(t) =>
              setForm({ ...form, areaServicio: t })
            }
          />
        )}

        <TouchableOpacity style={styles.button} onPress={guardarPersonal}>
          <Text style={styles.buttonText}>GUARDAR PERSONAL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={borrarTodo}
        >
          <Text style={styles.buttonText}>BORRAR TODO</Text>
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

  label: {
    marginTop: 15,
    fontWeight: "bold",
    color: "#1565C0",
  },

  input: {
    borderWidth: 1,
    borderColor: "#1565C0",
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
  },

  turnoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  turnoButton: {
    borderWidth: 1,
    borderColor: "#1565C0",
    padding: 10,
    borderRadius: 10,
    width: "32%",
    alignItems: "center",
  },

  turnoActivo: {
    backgroundColor: "#1565C0",
  },

  turnoText: {
    fontWeight: "bold",
    color: "#0D47A1",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  button: {
    backgroundColor: "#1565C0",
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
  },

  deleteButton: {
    backgroundColor: "#C62828",
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});