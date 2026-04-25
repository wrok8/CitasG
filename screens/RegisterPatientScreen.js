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

import { ref, onValue, push, update } from "firebase/database";
import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as SQLite from "expo-sqlite";
import { guardarMovimiento } from "../database";

export default function RegisterPatientScreen({
  setScreen,
  setPacienteActual,
  pacienteActual,
}) {

  const STORAGE_KEY = "@usuarios_app";
  const USER_SELECTED = "@usuario_seleccionado";

  const [usuarios, setUsuarios] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [medicos, setMedicos] = useState([]);
  const [citasExistentes, setCitasExistentes] = useState([]);

  const formInicial = {
    nombre: "",
    contacto: "",
    email: "",
    telefono: "",
    fecha: new Date(),
    sintomas: "",
    //lo q agregue del examen para las citas
    hora: "",
    medicoId: "",
    medicoNombre: "",
    motivo: "",
    tipoCita: "Primera vez",
    status: "Agenda",

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
  cargarMedicos();
  cargarCitasExistentes();

  if (pacienteActual) {
    setForm((prev) => ({
      ...prev,
      ...pacienteActual,
      medicoId: pacienteActual.medicoId || "",
      medicoNombre: pacienteActual.medicoNombre || "",
      evaluaciones:
        pacienteActual.evaluaciones ||
        formInicial.evaluaciones,
    }));
  }
}, [pacienteActual]);



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

    const cargarCitasExistentes = () => {
    const citasRef = ref(db, "citas");

    onValue(citasRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const lista = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setCitasExistentes(lista);
      } else {
        setCitasExistentes([]);
      }
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

  const guardarCita = async () => {
  const nuevaCita = {
      pacienteId: form.telefono,
      nombre: form.nombre,
      medicoId: form.medicoId,
      medicoNombre: form.medicoNombre,
      fecha: form.fecha.toISOString(),
      hora: form.hora,
      motivo: form.motivo,
      evaluaciones: form.evaluaciones,
      tipoCita: form.tipoCita,
      status: "Agenda",
    };

    const nuevaRef = push(ref(db, "citas"));
    const citaId = nuevaRef.key;

    await update(nuevaRef, nuevaCita);

    setPacienteActual({
      id: citaId,
      ...nuevaCita,
    });

    setPacienteActual(nuevaCita);
    setScreen("Resumen");
  };

  const validarDisponibilidadHorario = () => {
  const nuevaFechaHora = new Date(form.fecha);
  
  const [horas, minutos] = form.hora.split(":");
  nuevaFechaHora.setHours(
    parseInt(horas),
    parseInt(minutos),
    0
  );

  const conflicto = citasExistentes.some((cita) => {
    if (cita.medicoId !== form.medicoId) return false;

    const fechaExistente = new Date(cita.fecha);

    const [h, m] = cita.hora.split(":");
    fechaExistente.setHours(
      parseInt(h),
      parseInt(m),
      0
    );

    const diferencia =
      Math.abs(
        nuevaFechaHora - fechaExistente
      ) /
      (1000 * 60);

    return diferencia < 30;
  });

  return !conflicto;
};

const guardarCitaYContinuar = async (pantallaDestino) => {

  if (!validarDisponibilidadHorario()) {
  Alert.alert(
    "Horario ocupado",
    "El médico ya tiene una cita en ese horario. Debe haber al menos 30 minutos de diferencia."
  );
  return;
}

  if (!form.nombre || !form.telefono) {
    Alert.alert("Error", "Debes seleccionar un usuario");
    return;
  }

  try {
    let citaId = pacienteActual?.id;

    const datosCita = {
      pacienteId: form.telefono,
      nombre: form.nombre,
      contacto: form.contacto,
      email: form.email,
      telefono: form.telefono,
      medicoId: form.medicoId,
      medicoNombre: form.medicoNombre,
      fecha:
        form.fecha instanceof Date
          ? form.fecha.toISOString()
          : form.fecha,
      hora: form.hora,
      motivo: form.motivo,
      sintomas: form.sintomas,
      evaluaciones: form.evaluaciones,
      tipoCita: "Primera vez",
      status: "Agenda",
      pruebas: pacienteActual?.pruebas || [],
      signosVitales: pacienteActual?.signosVitales || [],
    };

    if (!citaId) {
      const nuevaRef = push(ref(db, "citas"));
      citaId = nuevaRef.key;

      await update(nuevaRef, datosCita);
    } else {
      await update(ref(db, `citas/${citaId}`), datosCita);
    }

    setPacienteActual({
      id: citaId,
      ...datosCita,
    });

    await guardarMovimiento(
    form.medicoNombre || "Sistema",
    "Cita agendada"
  );


    setScreen(pantallaDestino);
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "No se pudo guardar la cita");
  }
};

  

  const handleNavigate = async (screenName) => {
  try {
    let citaId = pacienteActual?.id;

    const datosCita = {
      pacienteId: form.telefono,
      nombre: form.nombre,
      contacto: form.contacto,
      email: form.email,
      telefono: form.telefono,
      medicoId: form.medicoId,
      medicoNombre: form.medicoNombre,
      fecha:
        form.fecha instanceof Date
          ? form.fecha.toISOString()
          : form.fecha,
      hora: form.hora,
      motivo: form.motivo,
      sintomas: form.sintomas,
      evaluaciones: form.evaluaciones,
      tipoCita: "Primera vez",
      status: "Agenda",
      pruebas: pacienteActual?.pruebas || [],
      signosVitales: pacienteActual?.signosVitales || [],
    };

    // Si aún no existe en Firebase, crear
    if (!citaId) {
      const nuevaRef = push(ref(db, "citas"));
      citaId = nuevaRef.key;

      await update(nuevaRef, datosCita);
    } else {
      await update(ref(db, `citas/${citaId}`), datosCita);
    }

    setPacienteActual({
      id: citaId,
      ...datosCita,
    });

    setScreen(screenName);
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "No se pudo guardar la cita");
  }
};

  let dbLocal = null;

  const cargarMedicos = async () => {
    try {
      if (!dbLocal) {
        dbLocal = await SQLite.openDatabaseAsync("hospital.db");
      }

      const lista = await dbLocal.getAllAsync(
        "SELECT * FROM personal"
      );

      setMedicos(lista);
    } catch (error) {
      console.log("Error al cargar médicos:", error);
      setMedicos([]);
    }
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
        
        <Text style={styles.label}>Seleccionar Médico</Text>
        {medicos.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={styles.userCard}
            onPress={() =>
              setForm({
                ...form,
                medicoId: m.id,
                medicoNombre: `${m.nombre} ${m.apellido1}`
              })
            }
          >
            <Text style={styles.userName}>
              Dr. {m.nombre} {m.apellido1}
            </Text>
            <Text>{m.especialidad}</Text>
            <Text>{m.turno}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>Hora</Text>
        <TextInput
          style={styles.input}
          placeholder="10:00"
          value={form.hora}
          onChangeText={(t) => setForm({ ...form, hora: t })}
        />

        <Text style={styles.label}>Motivo</Text>
        <TextInput
          style={styles.input}
          value={form.motivo}
          onChangeText={(t) => setForm({ ...form, motivo: t })}
        />


        



        

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
          onPress={() => guardarCitaYContinuar("Resumen")}
        >
          <Text style={styles.buttonText}>
            GUARDAR Y VER RESUMEN
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => guardarCitaYContinuar("Signos Vitales")}
        >
          <Text style={styles.buttonText}>
            TOMAR SIGNOS VITALES
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