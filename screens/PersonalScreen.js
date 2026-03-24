import React, { useState, useEffect } from "react";
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
 
import * as SQLite from "expo-sqlite";
 
export default function PersonalScreen() {
 
  const [db, setDb] = useState(null);
 
  const formInicial = {
    id: null,
    rfc: "",
    nombre: "",
    apellido1: "",
    apellido2: "",
    profesion: "",
    especialidad: "",
    turno: "",
    urgencia: false,
  };
 
  const [form, setForm] = useState(formInicial);
  const [personal, setPersonal] = useState([]);
 
  useEffect(() => {
    const initDB = async () => {
      const database = await SQLite.openDatabaseAsync("hospital.db");
 
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS personal (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          rfc TEXT,
          nombre TEXT,
          apellido1 TEXT,
          apellido2 TEXT,
          profesion TEXT,
          especialidad TEXT,
          turno TEXT,
          urgencia INTEGER
        );
      `);
 
      setDb(database);
    };
 
    initDB();
  }, []);
 
  const cargarPersonal = async () => {
    if (!db) return;
    const result = await db.getAllAsync("SELECT * FROM personal");
    setPersonal(result);
  };
 
  useEffect(() => {
    if (db) cargarPersonal();
  }, [db]);
 
  const guardarPersonal = async () => {
    if (!form.nombre || !form.rfc) {
      Alert.alert("Error", "RFC y nombre son obligatorios");
      return;
    }
 
    if (!db) return;
 
    if (form.id) {
      await db.runAsync(
        `UPDATE personal SET
        rfc=?, nombre=?, apellido1=?, apellido2=?, profesion=?, especialidad=?, turno=?, urgencia=?
        WHERE id=?`,
        [
          form.rfc,
          form.nombre,
          form.apellido1,
          form.apellido2,
          form.profesion,
          form.especialidad,
          form.turno,
          form.urgencia ? 1 : 0,
          form.id,
        ]
      );
      Alert.alert("Actualizado");
    } else {
      await db.runAsync(
        `INSERT INTO personal
        (rfc, nombre, apellido1, apellido2, profesion, especialidad, turno, urgencia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          form.rfc,
          form.nombre,
          form.apellido1,
          form.apellido2,
          form.profesion,
          form.especialidad,
          form.turno,
          form.urgencia ? 1 : 0,
        ]
      );
      Alert.alert("Guardado");
    }
 
    setForm(formInicial);
    cargarPersonal();
  };
 
  const eliminarPersonal = (id) => {
    Alert.alert("Confirmar", "¿Eliminar registro?", [
      { text: "Cancelar" },
      {
        text: "Sí",
        onPress: async () => {
          await db.runAsync("DELETE FROM personal WHERE id=?", [id]);
          cargarPersonal();
        },
      },
    ]);
  };
 
  const editarPersonal = (item) => {
    setForm({
      ...item,
      urgencia: item.urgencia === 1,
    });
  };
 
  return (
    <ScrollView contentContainerStyle={styles.container}>
     
      <Text style={styles.subtitle}>Registro de Personal</Text>
 
      <Text style={styles.label}>RFC</Text>
      <TextInput style={styles.input} value={form.rfc}
        onChangeText={(t) => setForm({ ...form, rfc: t })}
      />
 
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={form.nombre}
        onChangeText={(t) => setForm({ ...form, nombre: t })}
      />
 
      <Text style={styles.label}>1er Apellido</Text>
      <TextInput style={styles.input} value={form.apellido1}
        onChangeText={(t) => setForm({ ...form, apellido1: t })}
      />
 
      <Text style={styles.label}>2do Apellido</Text>
      <TextInput style={styles.input} value={form.apellido2}
        onChangeText={(t) => setForm({ ...form, apellido2: t })}
      />
 
      <Text style={styles.label}>Profesión</Text>
      <TextInput style={styles.input} value={form.profesion}
        onChangeText={(t) => setForm({ ...form, profesion: t })}
      />
 
      <Text style={styles.label}>Especialidad</Text>
      <TextInput style={styles.input} value={form.especialidad}
        onChangeText={(t) => setForm({ ...form, especialidad: t })}
      />
 
      <Text style={styles.subtitle}>Turno</Text>
 
      <View style={styles.turnoContainer}>
        {["Matutino", "Vespertino", "Nocturno"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.turnoButton,
              form.turno === t && styles.turnoActivo,
            ]}
            onPress={() => setForm({ ...form, turno: t })}
          >
            <Text
              style={[
                styles.turnoText,
                form.turno === t && { color: "#fff" },
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
 
      <View style={styles.switchRow}>
        <Text style={{ fontWeight: "bold" }}>Área de Urgencia</Text>
        <Switch
          value={form.urgencia}
          onValueChange={(v) => setForm({ ...form, urgencia: v })}
          trackColor={{ true: "#1565C0" }}
        />
      </View>
 
      <TouchableOpacity style={styles.button} onPress={guardarPersonal}>
        <Text style={styles.buttonText}>
          {form.id ? "ACTUALIZAR PERSONAL" : "GUARDAR PERSONAL"}
        </Text>
      </TouchableOpacity>
 
      {/* LISTA */}
      <Text style={styles.subtitle}>Personal Registrado</Text>
 
      {personal.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.nombre}>
            {item.nombre} {item.apellido1}
          </Text>
 
          <Text style={styles.info}>RFC: {item.rfc}</Text>
          <Text style={styles.info}>Especialidad: {item.especialidad}</Text>
          <Text style={styles.info}>Turno: {item.turno}</Text>
 
          {item.urgencia === 1 && (
            <Text style={styles.urgencia}>⚠ Área de Urgencias</Text>
          )}
 
          <View style={styles.botones}>
            <TouchableOpacity
              style={[styles.buttonSmall, styles.editButton]}
              onPress={() => editarPersonal(item)}
            >
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
 
            <TouchableOpacity
              style={[styles.buttonSmall, styles.deleteButton]}
              onPress={() => eliminarPersonal(item.id)}
            >
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
 
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { padding: 20 },
 
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    color: "#0D47A1",
  },
 
  label: {
    marginTop: 10,
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
    marginVertical: 15,
  },
 
  button: {
    backgroundColor: "#1565C0",
    padding: 18,
    borderRadius: 12,
    marginTop: 10,
  },
 
  buttonSmall: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginRight: 5,
  },
 
  editButton: {
    backgroundColor: "#2E7D32",
  },
 
  deleteButton: {
    backgroundColor: "#C62828",
  },
 
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
 
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    backgroundColor: "#fff",
    elevation: 2,
  },
 
  nombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D47A1",
  },
 
  info: {
    marginTop: 3,
    color: "#444",
  },
 
  urgencia: {
    marginTop: 5,
    color: "#C62828",
    fontWeight: "bold",
  },
 
  botones: {
    flexDirection: "row",
    marginTop: 10,
  },
});