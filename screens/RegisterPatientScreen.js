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

export default function RegisterPatientScreen({
  setScreen,
  setPacienteActual,
  pacienteActual,
}) {

  const STORAGE_KEY = "@usuarios_app";
  const USER_SELECTED = "@usuario_seleccionado";

  const [usuarios, setUsuarios] = useState([]);
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

  useEffect(() => {
    cargarUsuarios();
    cargarUsuarioSeleccionado();
  }, []);

  const cargarUsuarios = () => {
    const usuariosRef = ref(db, "usuarios");

    onValue(usuariosRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const lista = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
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

        setForm((prev) => ({
          ...prev,
          nombre: usuario.nombre,
          contacto: usuario.correo, 
          email: usuario.correo,
          telefono: usuario.telefono
        }));
      }
    } catch (error) {
      Alert.alert("Error","No se pudo cargar el usuario seleccionado");
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleSubmit = () => {

    if (!form.nombre || !form.telefono) {
      Alert.alert("Error", "Debes seleccionar un usuario");
      return;
    }

    const nuevaCita = {
      usuarioId: form.telefono, 
      nombre: form.nombre,
      contacto: form.contacto,
      email: form.email,
      telefono: form.telefono,
      fecha: form.fecha.toISOString(),
      sintomas: form.sintomas,
      evaluaciones: form.evaluaciones,
      creadoEn: new Date().toISOString()
    };

    push(ref(db, "pacientes"), nuevaCita);

    setPacienteActual(nuevaCita);
    setScreen("Resumen");
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
            <Text style={styles.pacienteTexto}>
              Paciente actual: {form.nombre}
            </Text>
          </View>
        )}

        <Text style={styles.subtitle}>Seleccionar Usuario</Text>

        {usuarios.map((u) => (

          <TouchableOpacity
            key={u.id}
            style={styles.userCard}
            onPress={() => seleccionarUsuario(u)}
          >

            <Text style={styles.userName}>{u.nombre}</Text>
            <Text>Contacto: {u.contacto}</Text>
            <Text>Email: {u.correo}</Text>
            <Text>Tel: {u.telefono}</Text>

          </TouchableOpacity>

        ))}

        <Text style={styles.subtitle}>Datos del Paciente</Text>

        <Text style={styles.label}>Paciente</Text>

        <TextInput
          style={styles.input}
          value={form.nombre}
          editable={false}
        />

        <Text style={styles.label}>Contacto</Text>

        <TextInput
          style={styles.input}
          value={form.contacto}
          editable={false}
        />

        <Text style={styles.label}>Email</Text>

        <TextInput
          style={styles.input}
          value={form.email}
          editable={false}
        />

        <Text style={styles.label}>Teléfono</Text>

        <TextInput
          style={styles.input}
          value={form.telefono}
          editable={false}
        />

        <Text style={styles.label}>Fecha de Cita</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >

          <Text style={styles.dateText}>
            {formatDate(form.fecha)}
          </Text>

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
            <Text style={styles.buttonText}>
              IR A COGNITIVO MENU
            </Text>
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
            <Text style={styles.buttonText}>
              IR A AFECTIVO MENU
            </Text>
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
            <Text style={styles.buttonText}>
              IR A FUNCIONAMIENTO MENU
            </Text>
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
            <Text style={styles.buttonText}>
              IR A NUTRICIONAL MENU
            </Text>
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
            <Text style={styles.buttonText}>
              IR A ENTORNO MENU
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            VER RESUMEN
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container:{ padding:20 },
  pacienteActivo:{
    backgroundColor:"#E3F2FD",
    padding:12,
    borderRadius:10,
    marginBottom:15
  },
  pacienteTexto:{
    fontWeight:"bold",
    color:"#0D47A1"
  },
  subtitle:{
    fontSize:20,
    fontWeight:"bold",
    marginBottom:15,
    color:"#0D47A1"
  },
  label:{
    marginTop:15,
    fontWeight:"bold",
    color:"#1565C0"
  },
  input:{
    borderWidth:1,
    borderColor:"#1565C0",
    borderRadius:10,
    padding:12,
    marginTop:5
  },
  textArea:{
    height:100,
    textAlignVertical:"top"
  },
  dateButton:{
    borderWidth:1,
    borderColor:"#1565C0",
    padding:15,
    borderRadius:10,
    backgroundColor:"#E3F2FD",
    marginTop:5
  },
  dateText:{ fontSize:16 },
  switchRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginVertical:10
  },
  button:{
    backgroundColor:"#1565C0",
    padding:18,
    borderRadius:12,
    marginTop:15
  },
  secondaryButton:{
    backgroundColor:"#2E7D32"
  },
  buttonText:{
    color:"white",
    textAlign:"center",
    fontWeight:"bold"
  },
  userCard:{
    borderWidth:1,
    borderColor:"#ccc",
    padding:10,
    borderRadius:10,
    marginBottom:10
  },
  userName:{
    fontWeight:"bold",
    fontSize:16
  }
});