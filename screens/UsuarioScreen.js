import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { ref, push, onValue, remove } from "firebase/database";
import { db } from "../firebaseConfig";

export default function UsuarioScreen({ setScreen }) {

  const [form, setForm] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    edad: "",
    genero: "",
    telefono: "",
    correo: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    ocupacion: "",
    estadoCivil: "",
    contactoEmergenciaNombre: "",
    contactoEmergenciaTelefono: "",
    parentesco: "",
    alergias: "",
    enfermedades: "",
    medicamentos: "",
    notas: ""
  });

  const [usuarios, setUsuarios] = useState([]);

  const USER_SELECTED = "@usuario_seleccionado";

  useEffect(() => {
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
  }, []);

  const handleChange = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const limpiarCampos = () => {
    setForm({
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      edad: "",
      genero: "",
      telefono: "",
      correo: "",
      direccion: "",
      ciudad: "",
      estado: "",
      codigoPostal: "",
      ocupacion: "",
      estadoCivil: "",
      contactoEmergenciaNombre: "",
      contactoEmergenciaTelefono: "",
      parentesco: "",
      alergias: "",
      enfermedades: "",
      medicamentos: "",
      notas: ""
    });
  };

  const guardarUsuario = () => {

    if (!form.nombre || !form.telefono || !form.correo) {
      Alert.alert("Error", "Completa los campos obligatorios");
      return;
    }

    push(ref(db, "usuarios"), form);

    limpiarCampos();
    Alert.alert("Usuario guardado en Firebase");
  };

  const escogerUsuario = async (usuario) => {
    await AsyncStorage.setItem(USER_SELECTED, JSON.stringify(usuario));
    Alert.alert("Usuario seleccionado", usuario.nombre);

    if (setScreen) {
      setScreen("RegisterPatient");
    }
  };

  const eliminarUsuario = (id) => {
    remove(ref(db, `usuarios/${id}`));
    Alert.alert("Usuario eliminado");
  };

  const eliminarTodos = () => {
    remove(ref(db, "usuarios"));
    Alert.alert("Todos eliminados");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.titulo}>Registrar Usuario</Text>

      {Object.keys(form).map((campo) => (
        <TextInput
          key={campo}
          style={styles.input}
          placeholder={campo}
          value={form[campo]}
          onChangeText={(text) => handleChange(campo, text)}
        />
      ))}

      <View style={styles.boton}>
        <Button title="Guardar Usuario" onPress={guardarUsuario} />
      </View>

      <View style={styles.boton}>
        <Button title="Eliminar Todos" onPress={eliminarTodos} />
      </View>

      <View style={styles.resultado}>
        <Text style={styles.subtitulo}>Usuarios Guardados</Text>

        {usuarios.map((u) => (
          <View key={u.id} style={styles.card}>
            <Text style={styles.nombre}>
              {u.nombre} {u.apellidoPaterno}
            </Text>
            <Text>Tel: {u.telefono}</Text>
            <Text>Email: {u.correo}</Text>

            <View style={styles.botonesCard}>
              <TouchableOpacity style={styles.botonEscoger} onPress={() => escogerUsuario(u)}>
                <Text style={styles.textoBoton}>Escoger</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarUsuario(u.id)}>
                <Text style={styles.textoBoton}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ padding:20 },
  titulo:{ fontSize:24, fontWeight:"bold", marginBottom:20 },
  input:{ borderWidth:1, borderColor:"#999", borderRadius:8, padding:10, marginTop:10 },
  boton:{ marginTop:15 },
  resultado:{ marginTop:25 },
  subtitulo:{ fontSize:18, fontWeight:"bold" },
  card:{ borderWidth:1, borderColor:"#ccc", padding:12, marginTop:10, borderRadius:10 },
  nombre:{ fontWeight:"bold", fontSize:16 },
  botonesCard:{ flexDirection:"row", marginTop:10, gap:10 },
  botonEscoger:{ backgroundColor:"#1565C0", padding:10, borderRadius:6 },
  botonEliminar:{ backgroundColor:"#C62828", padding:10, borderRadius:6 },
  textoBoton:{ color:"white", fontWeight:"bold" }
});